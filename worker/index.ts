// Two jobs, deliberately kept apart:
//
//   scheduled()  runs on the cron trigger, talks to alfa-leetcode-api, and
//                writes the merged result to KV. Nobody is waiting on it.
//   fetch()      answers /api/leetcode by reading KV. It never calls the
//                upstream, so a visitor's page load can't be slowed down or
//                broken by a cold start or a rate limit.
//
// Everything else falls through to the static assets.
import {
  createLeetCodeClient,
  fetchLeetCodeData,
  type LeetCodeData,
  type SolvedProblem,
} from '../src/lib/leetcode'

/** Single KV key holding the whole dashboard payload. */
const DATA_KEY = 'leetcode:data'

/**
 * Browser cache lifetime for /api/leetcode. Shorter than the cron interval so a
 * refresh is visible on the next load, long enough that a reload spam doesn't
 * re-fetch. KV itself is the source of truth.
 */
const BROWSER_CACHE_SECONDS = 300

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

/**
 * Pulls fresh data and merges it into whatever is already stored.
 *
 * KV is only written on success. If the upstream is rate-limited or cold, the
 * previous payload stays exactly where it is and the site keeps serving it —
 * that is the whole point of not fetching on the read path.
 */
async function refresh(env: Env): Promise<LeetCodeData> {
  const stored = await env.LEETCODE.get<LeetCodeData>(DATA_KEY, 'json')

  // Stored history is what lets the dashboard show more than LeetCode's ~20
  // most recent submissions, and it keeps difficulty lookups to new slugs only.
  const existing: SolvedProblem[] = stored?.solved ?? []

  const client = createLeetCodeClient({ baseUrl: env.LEETCODE_API_BASE })
  const { totals, solved } = await fetchLeetCodeData(env.LEETCODE_USERNAME, existing, client)

  const data: LeetCodeData = {
    username: env.LEETCODE_USERNAME,
    updatedAt: new Date().toISOString().slice(0, 10),
    totals,
    solved,
  }

  await env.LEETCODE.put(DATA_KEY, JSON.stringify(data))
  return data
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    // run_worker_first only routes /api/*, but be explicit rather than assume.
    if (url.pathname !== '/api/leetcode') return env.ASSETS.fetch(request)
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, { Allow: 'GET' })

    // Read as text: the payload goes straight out, so parsing and re-encoding
    // it here would be wasted work.
    const cached = await env.LEETCODE.get(DATA_KEY, 'text')

    if (cached === null) {
      // Only before the first successful cron run. The client falls back to the
      // build-time snapshot, so this is a soft failure.
      return json({ error: 'No data yet' }, 503, { 'Cache-Control': 'no-store' })
    }

    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${BROWSER_CACHE_SECONDS}`,
      },
    })
  },

  async scheduled(controller, env): Promise<void> {
    try {
      const data = await refresh(env)
      console.log(
        JSON.stringify({
          event: 'leetcode.refresh',
          cron: controller.cron,
          solved: data.solved.length,
          totals: data.totals,
        }),
      )
    } catch (error) {
      // Rethrow so the failure is recorded against the cron invocation instead
      // of being silently swallowed. KV still holds the last good payload.
      console.error(
        JSON.stringify({
          event: 'leetcode.refresh.failed',
          cron: controller.cron,
          message: error instanceof Error ? error.message : String(error),
        }),
      )
      throw error
    }
  },
} satisfies ExportedHandler<Env>

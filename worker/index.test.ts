// Exercises the Worker's two handlers directly against a fake KV namespace.
// No Workers runtime needed: the handlers only touch bindings and fetch, both
// of which are injected here.
import worker from './index'
import type { LeetCodeData } from '../src/lib/leetcode'

/** Minimal stand-in for the parts of KVNamespace this Worker uses. */
function fakeKv(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))
  return {
    store,
    get: async (key: string, type?: string) => {
      const raw = store.get(key)
      if (raw === undefined) return null
      return type === 'json' ? JSON.parse(raw) : raw
    },
    put: async (key: string, value: string) => void store.set(key, value),
  }
}

const stored: LeetCodeData = {
  username: 'TristanNguyen0',
  updatedAt: '2026-07-30',
  totals: { easy: 1, medium: 0, hard: 0 },
  solved: [{ title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', completedAt: '2026-07-01' }],
}

const upstream = {
  profile: {
    easySolved: 2,
    mediumSolved: 0,
    hardSolved: 0,
    recentSubmissions: [
      { title: 'Valid Anagram', titleSlug: 'valid-anagram', timestamp: '1785505142', statusDisplay: 'Accepted' },
      { title: 'Two Sum', titleSlug: 'two-sum', timestamp: '1785505000', statusDisplay: 'Accepted' },
    ],
  },
  difficulty: { difficulty: 'Easy' },
}

function makeEnv(kv = fakeKv(), upstreamFetch?: typeof globalThis.fetch) {
  const assetsFetch = vi.fn(async () => new Response('index.html'))
  vi.stubGlobal(
    'fetch',
    upstreamFetch ??
      (async (url: string | URL) =>
        String(url).includes('/select') ? Response.json(upstream.difficulty) : Response.json(upstream.profile)),
  )
  return {
    kv,
    assetsFetch,
    env: {
      LEETCODE: kv,
      ASSETS: { fetch: assetsFetch },
      LEETCODE_USERNAME: 'TristanNguyen0',
      LEETCODE_API_BASE: 'https://api.test',
    } as unknown as Env,
  }
}

const cron = { cron: '*/15 * * * *' } as ScheduledController

afterEach(() => vi.unstubAllGlobals())

test('GET /api/leetcode serves what the cron stored', async () => {
  const { env } = makeEnv(fakeKv({ 'leetcode:data': JSON.stringify(stored) }))
  const res = await worker.fetch(new Request('https://example.com/api/leetcode'), env)

  expect(res.status).toBe(200)
  expect(res.headers.get('Cache-Control')).toContain('max-age=300')
  expect(await res.json()).toEqual(stored)
})

test('GET /api/leetcode does not call the upstream API', async () => {
  const upstreamFetch = vi.fn()
  const { env } = makeEnv(fakeKv({ 'leetcode:data': JSON.stringify(stored) }), upstreamFetch as never)
  await worker.fetch(new Request('https://example.com/api/leetcode'), env)
  expect(upstreamFetch).not.toHaveBeenCalled()
})

test('answers 503 before the first cron run has populated KV', async () => {
  const { env } = makeEnv()
  const res = await worker.fetch(new Request('https://example.com/api/leetcode'), env)
  expect(res.status).toBe(503)
  expect(res.headers.get('Cache-Control')).toBe('no-store')
})

test('rejects non-GET methods', async () => {
  const { env } = makeEnv()
  const res = await worker.fetch(new Request('https://example.com/api/leetcode', { method: 'POST' }), env)
  expect(res.status).toBe(405)
  expect(res.headers.get('Allow')).toBe('GET')
})

test('anything outside /api falls through to static assets', async () => {
  const { env, assetsFetch } = makeEnv()
  await worker.fetch(new Request('https://example.com/about'), env)
  expect(assetsFetch).toHaveBeenCalledOnce()
})

test('the cron merges new solves into the stored history', async () => {
  const { env, kv } = makeEnv(fakeKv({ 'leetcode:data': JSON.stringify(stored) }))
  await worker.scheduled(cron, env)

  const written = JSON.parse(kv.store.get('leetcode:data')!) as LeetCodeData
  expect(written.totals).toEqual({ easy: 2, medium: 0, hard: 0 })
  expect(written.solved.map((s) => s.titleSlug)).toEqual(['valid-anagram', 'two-sum'])
  // The stored solve keeps its original date rather than the feed's timestamp.
  expect(written.solved[1].completedAt).toBe('2026-07-01')
})

test('a failing upstream leaves the last good payload untouched', async () => {
  const kv = fakeKv({ 'leetcode:data': JSON.stringify(stored) })
  const { env } = makeEnv(
    kv,
    (async () => new Response('Too many request from this IP, try again in 1 hour', { status: 429 })) as never,
  )

  await expect(worker.scheduled(cron, env)).rejects.toThrow(/429/)
  expect(JSON.parse(kv.store.get('leetcode:data')!)).toEqual(stored)
})

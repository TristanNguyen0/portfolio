// Client for alfa-leetcode-api (https://github.com/alfaarghya/alfa-leetcode-api),
// a REST wrapper over LeetCode's unofficial GraphQL API.
//
// Deliberately free of Node/DOM/React specifics: it runs unchanged in the sync
// script (Node), in the browser, and in a Cloudflare Worker, so the choice of
// *where* the fetch happens stays a one-line decision.

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface SolvedProblem {
  title: string
  titleSlug: string
  difficulty: Difficulty
  completedAt: string
}

export interface LeetCodeData {
  username: string
  updatedAt: string
  totals: { easy: number; medium: number; hard: number }
  solved: SolvedProblem[]
}

/** Shared instance on Render's free tier: 120 req/hour per IP, and cold starts. */
export const DEFAULT_API_BASE = 'https://alfa-leetcode-api.onrender.com'

export class LeetCodeApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'LeetCodeApiError'
    this.status = status
  }
}

/** The subset of GET /:username/profile this dashboard reads. */
interface ProfileResponse {
  easySolved: number
  mediumSolved: number
  hardSolved: number
  recentSubmissions: Array<{
    title: string
    titleSlug: string
    timestamp: string
    statusDisplay: string
  }>
}

/** The subset of GET /select?titleSlug=... this dashboard reads. */
interface QuestionResponse {
  difficulty: Difficulty
}

export interface ClientOptions {
  baseUrl?: string
  /** Injectable for tests, and for a Worker that wants its own fetch. */
  fetch?: typeof globalThis.fetch
}

export function createLeetCodeClient({ baseUrl = DEFAULT_API_BASE, fetch = globalThis.fetch }: ClientOptions = {}) {
  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`)
    if (!res.ok) {
      // The rate limiter answers with plain text, not JSON, so surface the body.
      throw new LeetCodeApiError(`GET ${path} failed: ${res.status} ${(await res.text()).slice(0, 200)}`, res.status)
    }
    return (await res.json()) as T
  }

  return {
    /** Solve counts plus the ~20 most recent submissions, in a single request. */
    profile: (username: string) => get<ProfileResponse>(`/${encodeURIComponent(username)}/profile`),

    /**
     * Difficulty for one problem. The API has no bulk equivalent and this
     * response carries the full question HTML, so only ever call it for slugs
     * that aren't already recorded.
     */
    difficulty: async (titleSlug: string) =>
      (await get<QuestionResponse>(`/select?titleSlug=${encodeURIComponent(titleSlug)}`)).difficulty,
  }
}

export type LeetCodeClient = ReturnType<typeof createLeetCodeClient>

/** Unix seconds (as the API returns them) to the plain YYYY-MM-DD the UI renders. */
export function toIsoDate(timestamp: string | number): string {
  return new Date(Number(timestamp) * 1000).toISOString().slice(0, 10)
}

/**
 * Folds newly seen accepted submissions into the stored history.
 *
 * LeetCode only ever exposes the ~20 most recent submissions, so the stored
 * list is the only record of anything older. Existing entries therefore win on
 * conflict: a re-solve must not overwrite the original completion date.
 */
export function mergeSolves(existing: SolvedProblem[], incoming: SolvedProblem[]): SolvedProblem[] {
  const known = new Set(existing.map((s) => s.titleSlug))
  return [...existing, ...incoming.filter((s) => !known.has(s.titleSlug))].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  )
}

/**
 * Pulls the profile and resolves difficulties for any solve not already in
 * `existing`, returning the merged data. One request, plus one per new solve.
 */
export async function fetchLeetCodeData(
  username: string,
  existing: SolvedProblem[] = [],
  client: LeetCodeClient = createLeetCodeClient(),
): Promise<Omit<LeetCodeData, 'updatedAt'>> {
  const profile = await client.profile(username)

  const known = new Set(existing.map((s) => s.titleSlug))
  const fresh = profile.recentSubmissions.filter(
    (s) => s.statusDisplay === 'Accepted' && !known.has(s.titleSlug),
  )

  // Deduplicate first: the feed lists every accepted attempt, so one problem
  // solved twice would otherwise cost two identical difficulty lookups.
  const newest = new Map<string, (typeof fresh)[number]>()
  for (const s of fresh) if (!newest.has(s.titleSlug)) newest.set(s.titleSlug, s)

  const incoming = await Promise.all(
    [...newest.values()].map(async (s) => ({
      title: s.title,
      titleSlug: s.titleSlug,
      difficulty: await client.difficulty(s.titleSlug),
      completedAt: toIsoDate(s.timestamp),
    })),
  )

  return {
    username,
    totals: { easy: profile.easySolved, medium: profile.mediumSolved, hard: profile.hardSolved },
    solved: mergeSolves(existing, incoming),
  }
}

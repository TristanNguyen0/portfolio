import {
  LeetCodeApiError,
  createLeetCodeClient,
  fetchLeetCodeData,
  mergeSolves,
  toIsoDate,
  type SolvedProblem,
} from './leetcode'

const profile = {
  easySolved: 2,
  mediumSolved: 1,
  hardSolved: 0,
  recentSubmissions: [
    { title: 'Valid Anagram', titleSlug: 'valid-anagram', timestamp: '1785505142', statusDisplay: 'Accepted' },
    { title: 'Two Sum', titleSlug: 'two-sum', timestamp: '1785467652', statusDisplay: 'Accepted' },
  ],
}

const difficulties: Record<string, string> = { 'valid-anagram': 'Easy', 'two-sum': 'Easy' }

/** Stands in for alfa-leetcode-api, recording every path it was asked for. */
function stubApi(overrides: Record<string, unknown> = {}) {
  const calls: string[] = []
  const fetch = (async (url: string | URL) => {
    const { pathname, searchParams } = new URL(String(url))
    calls.push(pathname + (searchParams.size ? `?${searchParams}` : ''))

    if (pathname in overrides) {
      const value = overrides[pathname]
      if (value instanceof Response) return value
    }
    if (pathname.endsWith('/profile')) return Response.json(profile)
    if (pathname === '/select') {
      return Response.json({ difficulty: difficulties[searchParams.get('titleSlug') ?? ''] })
    }
    return new Response('not found', { status: 404 })
  }) as unknown as typeof globalThis.fetch

  return { calls, client: createLeetCodeClient({ baseUrl: 'https://api.test', fetch }) }
}

test('reads totals and new solves from the profile endpoint', async () => {
  const { client, calls } = stubApi()
  const data = await fetchLeetCodeData('TristanNguyen0', [], client)

  expect(data.totals).toEqual({ easy: 2, medium: 1, hard: 0 })
  expect(data.solved).toEqual([
    { title: 'Valid Anagram', titleSlug: 'valid-anagram', difficulty: 'Easy', completedAt: '2026-07-31' },
    { title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', completedAt: '2026-07-31' },
  ])
  expect(calls).toContain('/TristanNguyen0/profile')
})

test('skips the difficulty lookup for solves already recorded', async () => {
  const existing: SolvedProblem[] = [
    { title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', completedAt: '2020-01-01' },
  ]
  const { client, calls } = stubApi()
  const data = await fetchLeetCodeData('TristanNguyen0', existing, client)

  expect(calls.filter((c) => c.startsWith('/select'))).toEqual(['/select?titleSlug=valid-anagram'])
  // The original completion date survives; the feed's newer timestamp does not.
  expect(data.solved.at(-1)).toEqual(existing[0])
})

test('ignores submissions that were not accepted', async () => {
  const { client } = stubApi({
    '/TristanNguyen0/profile': Response.json({
      ...profile,
      recentSubmissions: [
        { title: 'Two Sum', titleSlug: 'two-sum', timestamp: '1785467652', statusDisplay: 'Wrong Answer' },
      ],
    }),
  })
  expect((await fetchLeetCodeData('TristanNguyen0', [], client)).solved).toEqual([])
})

test('surfaces the rate limiter as a LeetCodeApiError with its status', async () => {
  const { client } = stubApi({
    '/TristanNguyen0/profile': new Response('Too many request from this IP, try again in 1 hour', {
      status: 429,
    }),
  })
  await expect(fetchLeetCodeData('TristanNguyen0', [], client)).rejects.toMatchObject({
    constructor: LeetCodeApiError,
    status: 429,
  })
})

test('mergeSolves dedupes by slug and sorts newest first', () => {
  const existing: SolvedProblem[] = [
    { title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', completedAt: '2026-07-01' },
  ]
  const merged = mergeSolves(existing, [
    { title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', completedAt: '2026-07-30' },
    { title: 'Valid Anagram', titleSlug: 'valid-anagram', difficulty: 'Easy', completedAt: '2026-07-15' },
  ])
  expect(merged.map((s) => [s.titleSlug, s.completedAt])).toEqual([
    ['valid-anagram', '2026-07-15'],
    ['two-sum', '2026-07-01'],
  ])
})

test('toIsoDate converts unix seconds to a plain date', () => {
  expect(toIsoDate('1785505142')).toBe('2026-07-31')
})

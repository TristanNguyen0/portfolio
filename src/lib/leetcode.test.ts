import {
  LeetCodeApiError,
  createLeetCodeClient,
  fetchLeetCodeData,
  mergeSolves,
  toIsoDate,
  toLocalDate,
  todayInTimeZone,
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
    // 09:39 Toronto — same day in either zone.
    { title: 'Valid Anagram', titleSlug: 'valid-anagram', difficulty: 'Easy', completedAt: '2026-07-31' },
    // 23:14 Toronto, which is 03:14 UTC the next day. Dated locally, so the 30th.
    { title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', completedAt: '2026-07-30' },
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

// The bug these guard: an evening solve in Toronto is already tomorrow in UTC,
// so dating it from the UTC calendar filed it under the wrong day.

test('dates an evening solve by the Toronto day, not the UTC day', () => {
  // 2026-07-30 20:00 EDT === 2026-07-31 00:00 UTC
  const evening = new Date('2026-07-31T00:00:00Z')
  expect(evening.toISOString().slice(0, 10)).toBe('2026-07-31')
  expect(toLocalDate(evening)).toBe('2026-07-30')
})

test('follows EDT in summer and EST in winter', () => {
  // Both are 21:30 local the previous day, on either side of the DST boundary.
  expect(toLocalDate(new Date('2026-07-15T01:30:00Z'))).toBe('2026-07-14') // EDT, UTC-4
  expect(toLocalDate(new Date('2026-01-15T02:30:00Z'))).toBe('2026-01-14') // EST, UTC-5
})

test('leaves a midday solve on the same day in both zones', () => {
  const midday = new Date('2026-07-31T16:00:00Z')
  expect(toLocalDate(midday)).toBe('2026-07-31')
  expect(toLocalDate(midday)).toBe(midday.toISOString().slice(0, 10))
})

test('todayInTimeZone returns a plain YYYY-MM-DD', () => {
  expect(todayInTimeZone()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(todayInTimeZone()).toBe(toLocalDate(new Date()))
})

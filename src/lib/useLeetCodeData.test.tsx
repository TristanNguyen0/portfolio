import { render, screen, waitFor } from '@testing-library/react'
import LeetCodeDashboard from '../components/LeetCodeDashboard'
import { BUNDLED_SNAPSHOT } from './useLeetCodeData'
import type { LeetCodeData } from './leetcode'

const live: LeetCodeData = {
  username: 'TristanNguyen0',
  updatedAt: '2026-07-31',
  totals: { easy: 9, medium: 4, hard: 1 },
  solved: [
    { title: 'Trapping Rain Water', titleSlug: 'trapping-rain-water', difficulty: 'Hard', completedAt: '2026-07-31' },
  ],
}

afterEach(() => vi.unstubAllGlobals())

test('renders the bundled snapshot first, then swaps in the live payload', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(live)))
  render(<LeetCodeDashboard />)

  // Painted from the snapshot before any request resolves — no spinner, no shift.
  expect(screen.getByText(`${BUNDLED_SNAPSHOT.totals.easy} Easy`)).toBeInTheDocument()

  await waitFor(() => expect(screen.getByText('9 Easy')).toBeInTheDocument())
  expect(screen.getByRole('link', { name: 'Trapping Rain Water' })).toBeInTheDocument()
  expect(fetch).toHaveBeenCalledWith('/api/leetcode', expect.objectContaining({ signal: expect.anything() }))
})

test('keeps the snapshot when the Worker has no data yet', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'No data yet' }, { status: 503 })))
  render(<LeetCodeDashboard />)

  await waitFor(() => expect(fetch).toHaveBeenCalled())
  expect(screen.getByText(`${BUNDLED_SNAPSHOT.totals.easy} Easy`)).toBeInTheDocument()
})

test('keeps the snapshot when the request fails outright', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))))
  render(<LeetCodeDashboard />)

  await waitFor(() => expect(fetch).toHaveBeenCalled())
  expect(screen.getByText(`${BUNDLED_SNAPSHOT.totals.easy} Easy`)).toBeInTheDocument()
})

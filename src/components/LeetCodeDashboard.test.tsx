import { render, screen, within } from '@testing-library/react'
import { LeetCodeDashboardView, type LeetCodeData } from './LeetCodeDashboard'
import { formatDate } from '../lib/formatDate'

const fixture: LeetCodeData = {
  username: 'TristanNguyen0',
  updatedAt: '2026-07-30',
  totals: { easy: 2, medium: 1, hard: 0 },
  solved: [
    { title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', completedAt: '2026-07-01' },
    { title: 'Add Two Numbers', titleSlug: 'add-two-numbers', difficulty: 'Medium', completedAt: '2026-07-28' },
    { title: 'Valid Parentheses', titleSlug: 'valid-parentheses', difficulty: 'Easy', completedAt: '2026-07-15' },
  ],
}

test('lists solved problems newest first with completion dates', () => {
  render(<LeetCodeDashboardView data={fixture} />)
  const items = within(screen.getByRole('list', { name: /solved problems/i })).getAllByRole('listitem')
  expect(items.map((li) => within(li).getByRole('link').textContent)).toEqual([
    'Add Two Numbers',
    'Valid Parentheses',
    'Two Sum',
  ])
  expect(within(items[0]).getByText('Jul 28, 2026')).toBeInTheDocument()
})

test('links each problem to leetcode.com', () => {
  render(<LeetCodeDashboardView data={fixture} />)
  expect(screen.getByRole('link', { name: 'Two Sum' })).toHaveAttribute(
    'href',
    'https://leetcode.com/problems/two-sum/',
  )
})

test('shows difficulty totals', () => {
  render(<LeetCodeDashboardView data={fixture} />)
  expect(screen.getByText('3')).toBeInTheDocument()
  expect(screen.getByText('2 Easy')).toBeInTheDocument()
  expect(screen.getByText('1 Medium')).toBeInTheDocument()
  expect(screen.getByText('0 Hard')).toBeInTheDocument()
})

/** jsdom lays nothing out, so feed the hook the heights a browser would report. */
function measuringHeights({ panel, copy }: { panel: number; copy: number }) {
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.tagName === 'UL' ? copy : 0
  })
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
    return this.classList.contains('ticker') ? panel : 0
  })
}

afterEach(() => vi.restoreAllMocks())

test('drifts inside a height-capped panel', () => {
  const { container } = render(<LeetCodeDashboardView data={fixture} />)
  const panel = container.querySelector('.ticker')
  expect(panel).toHaveClass('max-h-72')
  expect(panel?.querySelector('.ticker-track')).toBeInTheDocument()
})

// The bug this guards: one cycle slides the track up by a single copy, so with a
// 288px panel over 180px copies, two copies run out 108px early and a blank band
// slides through. A third copy keeps the panel covered for the whole cycle.
test('stacks enough copies that the loop never reaches an end', () => {
  measuringHeights({ panel: 288, copy: 180 })
  const { container } = render(<LeetCodeDashboardView data={fixture} />)
  expect(container.querySelectorAll('ul')).toHaveLength(3)
  const shift = container.querySelector<HTMLElement>('.ticker')!.style.getPropertyValue('--ticker-shift')
  expect(parseFloat(shift)).toBeCloseTo(100 / 3)
})

test('uses no more copies than the panel needs when the list is already tall', () => {
  measuringHeights({ panel: 288, copy: 600 })
  const { container } = render(<LeetCodeDashboardView data={fixture} />)
  expect(container.querySelectorAll('ul')).toHaveLength(2)
  const shift = container.querySelector<HTMLElement>('.ticker')!.style.getPropertyValue('--ticker-shift')
  expect(parseFloat(shift)).toBeCloseTo(50)
})

// However many copies the loop needs, only one belongs in the accessibility tree —
// otherwise every solve is announced and tabbed through repeatedly.
test('hides the duplicated copies from assistive tech and the tab order', () => {
  measuringHeights({ panel: 288, copy: 180 })
  const { container } = render(<LeetCodeDashboardView data={fixture} />)
  expect(container.querySelectorAll('li')).toHaveLength(fixture.solved.length * 3)
  expect(screen.getAllByRole('listitem')).toHaveLength(fixture.solved.length)
  expect(screen.getAllByRole('link', { name: 'Two Sum' })).toHaveLength(1)
  expect(container.querySelectorAll('.ticker-clone a[tabindex="-1"]')).toHaveLength(fixture.solved.length * 2)
})

test('renders an empty state when nothing is solved yet', () => {
  render(<LeetCodeDashboardView data={{ ...fixture, totals: { easy: 0, medium: 0, hard: 0 }, solved: [] }} />)
  expect(screen.queryByRole('list', { name: /solved problems/i })).not.toBeInTheDocument()
  expect(screen.getByText(/recent solves will show up here/i)).toBeInTheDocument()
})

test('formatDate renders YYYY-MM-DD without timezone shift', () => {
  expect(formatDate('2026-01-01')).toBe('Jan 1, 2026')
  expect(formatDate('2025-12-31')).toBe('Dec 31, 2025')
})

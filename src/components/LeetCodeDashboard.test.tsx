import { render, screen, within } from '@testing-library/react'
import LeetCodeDashboard, { type LeetCodeData } from './LeetCodeDashboard'
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
  render(<LeetCodeDashboard data={fixture} />)
  const items = within(screen.getByRole('list', { name: /solved problems/i })).getAllByRole('listitem')
  expect(items.map((li) => within(li).getByRole('link').textContent)).toEqual([
    'Add Two Numbers',
    'Valid Parentheses',
    'Two Sum',
  ])
  expect(within(items[0]).getByText('Jul 28, 2026')).toBeInTheDocument()
})

test('links each problem to leetcode.com', () => {
  render(<LeetCodeDashboard data={fixture} />)
  expect(screen.getByRole('link', { name: 'Two Sum' })).toHaveAttribute(
    'href',
    'https://leetcode.com/problems/two-sum/',
  )
})

test('shows difficulty totals', () => {
  render(<LeetCodeDashboard data={fixture} />)
  expect(screen.getByText('3')).toBeInTheDocument()
  expect(screen.getByText('2 Easy')).toBeInTheDocument()
  expect(screen.getByText('1 Medium')).toBeInTheDocument()
  expect(screen.getByText('0 Hard')).toBeInTheDocument()
})

test('renders an empty state when nothing is solved yet', () => {
  render(<LeetCodeDashboard data={{ ...fixture, totals: { easy: 0, medium: 0, hard: 0 }, solved: [] }} />)
  expect(screen.queryByRole('list', { name: /solved problems/i })).not.toBeInTheDocument()
  expect(screen.getByText(/recent solves will show up here/i)).toBeInTheDocument()
})

test('formatDate renders YYYY-MM-DD without timezone shift', () => {
  expect(formatDate('2026-01-01')).toBe('Jan 1, 2026')
  expect(formatDate('2025-12-31')).toBe('Dec 31, 2025')
})

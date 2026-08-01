import { render, screen, within } from '@testing-library/react'
import BlogPost from './BlogPost'
import type { Post } from '../lib/posts'

const post: Post = {
  slug: 'a-post',
  number: 1,
  draft: false,
  title: 'A post',
  description: 'What it is about.',
  date: '2026-07-28',
  category: 'homelab',
  Content: () => (
    <>
      <p>Body copy.</p>
      <h2>First section</h2>
      <h3>A sub-heading</h3>
      <h2>Second section</h2>
      <h2>Second section</h2>
    </>
  ),
}

test('renders the title, description and formatted date', () => {
  render(<BlogPost post={post} />)
  expect(screen.getByRole('heading', { level: 1, name: 'A post' })).toBeInTheDocument()
  expect(screen.getByText('What it is about.')).toBeInTheDocument()
  expect(screen.getByText('Jul 28, 2026')).toBeInTheDocument()
})

test('derives the contents list from the headings in the body', () => {
  render(<BlogPost post={post} />)

  // One entry per heading, in both the sticky aside and the mobile <details>.
  const nav = screen.getByRole('navigation', { name: 'Contents' })
  expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual([
    'First section',
    'A sub-heading',
    'Second section',
    'Second section',
  ])
})

test('stamps unique ids on headings so duplicate titles still anchor correctly', () => {
  const { container } = render(<BlogPost post={post} />)

  expect(Array.from(container.querySelectorAll('.prose h2, .prose h3')).map((el) => el.id)).toEqual([
    'first-section',
    'a-sub-heading',
    'second-section',
    'second-section-2',
  ])
})

test('offers a way back to the index', () => {
  render(<BlogPost post={post} />)
  for (const link of screen.getAllByRole('link', { name: /all posts/i })) {
    expect(link).toHaveAttribute('href', '/blog')
  }
})

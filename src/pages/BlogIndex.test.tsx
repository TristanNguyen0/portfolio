import { render, screen } from '@testing-library/react'
import BlogIndex from './BlogIndex'
import { posts } from '../lib/posts'

test('renders a numbered row per post, linking to its slug', () => {
  render(<BlogIndex />)

  for (const post of posts) {
    const link = screen.getByRole('link', { name: new RegExp(post.title, 'i') })
    expect(link).toHaveAttribute('href', `/blog/${post.slug}`)
    expect(link).toHaveTextContent(String(post.number).padStart(2, '0'))
    expect(link).toHaveTextContent(post.description)
  }
})

// Deliberately doesn't assert the wording — the tagline is copy you'll keep
// editing; this only checks the page renders its heading at all.
test('renders a page heading', () => {
  render(<BlogIndex />)
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})

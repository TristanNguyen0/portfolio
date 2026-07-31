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

test('shows the tagline heading', () => {
  render(<BlogIndex />)
  expect(screen.getByRole('heading', { name: /notes from the bench/i })).toBeInTheDocument()
})

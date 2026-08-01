import { render, screen } from '@testing-library/react'
import App from './App'
import { categories } from './data/categories'

// Driven off the category data rather than hardcoded copy, so rewording a
// section heading or blurb doesn't break the suite.

test('renders the name and a section per category', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /tristan nguyen/i })).toBeInTheDocument()

  for (const category of categories) {
    expect(screen.getByText(category.title)).toBeInTheDocument()
    expect(screen.getByText(category.body)).toBeInTheDocument()
  }
})

test('badges the categories that declare a status', () => {
  render(<App />)

  for (const category of categories.filter((c) => c.status)) {
    expect(screen.getByText(category.status!)).toBeInTheDocument()
  }
})

test('no longer renders the Software section', () => {
  render(<App />)
  expect(screen.queryByText(/^Software$/)).not.toBeInTheDocument()
})

test('renders the LeetCode dashboard section', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /leetcode/i })).toBeInTheDocument()
})

test('links to the blog', () => {
  render(<App />)
  expect(screen.getAllByRole('link', { name: /blog/i })[0]).toHaveAttribute('href', '/blog')
})

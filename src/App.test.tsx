import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the name and the three sections', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /tristan nguyen/i })).toBeInTheDocument()
  expect(screen.getByText(/Homelab/i)).toBeInTheDocument()
  expect(screen.getByText(/CAD & 3D printing/i)).toBeInTheDocument()
  expect(screen.getByText(/Claude usage on Sensor Watch/i)).toBeInTheDocument()
})

test('no longer renders the Software section', () => {
  render(<App />)
  expect(screen.queryByText(/^Software$/)).not.toBeInTheDocument()
})

test('marks the unfinished project as in progress', () => {
  render(<App />)
  expect(screen.getByText(/In progress/i)).toBeInTheDocument()
})

test('renders the LeetCode dashboard section', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /leetcode/i })).toBeInTheDocument()
})

test('links to the blog', () => {
  render(<App />)
  expect(screen.getAllByRole('link', { name: /blog/i })[0]).toHaveAttribute('href', '/blog')
})

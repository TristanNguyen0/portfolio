import { render, screen, within } from '@testing-library/react'
import App from './App'
import { projects } from './data/projects'
import { techLabel } from './data/techPaths'

// Driven off the project data rather than hardcoded copy, so rewording a card
// or adding a project doesn't break the suite.

test('renders the name and a card per project', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /tristan nguyen/i })).toBeInTheDocument()

  for (const project of projects) {
    expect(screen.getByRole('heading', { name: project.name })).toBeInTheDocument()
    expect(screen.getByText(project.description)).toBeInTheDocument()
  }
})

test('shows each project stack as labelled icons', () => {
  render(<App />)

  for (const project of projects) {
    const stack = screen.getByRole('list', { name: `${project.name} stack` })
    expect(within(stack).getAllByRole('img')).toHaveLength(project.stack.length)

    for (const tech of project.stack) {
      expect(within(stack).getByRole('img', { name: techLabel(tech) })).toBeInTheDocument()
    }
  }
})

test('carries a hover label naming each technology in full', () => {
  render(<App />)

  const stack = within(screen.getByRole('list', { name: 'Mr Mouse Stats stack' }))
  // One tooltip per icon, and abbreviations are spelled out rather than repeated.
  expect(stack.getByText('Amazon Web Services')).toBeInTheDocument()
  expect(stack.queryByText('AWS')).not.toBeInTheDocument()
  expect(stack.getByText('PostgreSQL')).toBeInTheDocument()
})

test('links a project to its repo, and falls back to a status when there is none', () => {
  render(<App />)

  const withRepo = projects.find((project) => project.links.some((link) => link.kind === 'repo'))!
  const repo = withRepo.links.find((link) => link.kind === 'repo')!

  // Scoped to the card: the site footer carries a GitHub link of its own.
  const card = within(screen.getByRole('article', { name: withRepo.name }))
  expect(card.getByRole('link', { name: repo.label })).toHaveAttribute('href', repo.href)

  // A project with nothing to click through to still has to say where it stands,
  // rather than rendering an empty footer.
  for (const project of projects.filter((p) => p.links.length === 0)) {
    expect(screen.getByText(project.status!)).toBeInTheDocument()
  }
})

test('no longer renders the old category sections', () => {
  render(<App />)
  expect(screen.queryByText(/^Software$/)).not.toBeInTheDocument()
  expect(screen.queryByText(/^Homelab$/)).not.toBeInTheDocument()
  expect(screen.queryByText(/^CAD & 3D printing$/)).not.toBeInTheDocument()
})

test('renders the LeetCode dashboard section', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /leetcode/i })).toBeInTheDocument()
})

test('links to the blog', () => {
  render(<App />)
  expect(screen.getAllByRole('link', { name: /blog/i })[0]).toHaveAttribute('href', '/blog')
})

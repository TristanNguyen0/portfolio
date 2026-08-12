import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { projects } from './data/projects'
import { techColors, techLabel } from './data/techPaths'

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

test('links a project to its live deployment when it has one', () => {
  render(<App />)

  for (const project of projects) {
    for (const live of project.links.filter((link) => link.kind === 'live')) {
      const card = within(screen.getByRole('article', { name: project.name }))
      const link = card.getByRole('link', { name: live.label })
      expect(link).toHaveAttribute('href', live.href)
      expect(link).toHaveAttribute('target', '_blank')
    }
  }
})

test('paints each stack icon in its brand colour', () => {
  render(<App />)

  // techColors is a Record over TechName, so TypeScript already guarantees every
  // technology has an entry. What this pins is that the entry reaches the icon.
  for (const project of projects) {
    const stack = within(screen.getByRole('list', { name: `${project.name} stack` }))

    for (const tech of project.stack) {
      expect(stack.getByRole('img', { name: techLabel(tech) })).toHaveClass(techColors[tech])
    }
  }
})

// The capture gallery on a project card. Driven off whichever project declares
// images, so these keep working when a second project gets captures of its own.

const withImages = projects.find((project) => project.images?.length)!

test('fills the card frame with the first capture, and offers the rest as thumbnails', () => {
  render(<App />)

  const card = within(screen.getByRole('article', { name: withImages.name }))
  expect(card.getByRole('img', { name: withImages.images![0].alt })).toHaveAttribute(
    'src',
    withImages.images![0].src,
  )

  const thumbnails = within(card.getByRole('list', { name: `${withImages.name} screenshots` }))
  for (const image of withImages.images!) {
    expect(thumbnails.getByRole('button', { name: `Show: ${image.alt}` })).toBeInTheDocument()
  }
})

test('swaps the frame to the thumbnail that was picked', () => {
  render(<App />)

  const card = within(screen.getByRole('article', { name: withImages.name }))
  const second = withImages.images![1]

  fireEvent.click(card.getByRole('button', { name: `Show: ${second.alt}` }))
  expect(card.getByRole('button', { name: `Expand: ${second.alt}` })).toBeInTheDocument()
})

test('expands a capture, steps through the set, and closes', () => {
  render(<App />)

  const card = within(screen.getByRole('article', { name: withImages.name }))
  const [first, second] = withImages.images!
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  fireEvent.click(card.getByRole('button', { name: `Expand: ${first.alt}` }))
  let dialog = within(screen.getByRole('dialog'))
  expect(dialog.getByRole('img', { name: first.alt })).toHaveAttribute('src', first.src)

  fireEvent.click(dialog.getByRole('button', { name: /next screenshot/i }))
  dialog = within(screen.getByRole('dialog'))
  expect(dialog.getByRole('img', { name: second.alt })).toHaveAttribute('src', second.src)

  fireEvent.click(dialog.getByRole('button', { name: /close/i }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('closes the expanded capture on Escape', () => {
  render(<App />)

  const card = within(screen.getByRole('article', { name: withImages.name }))
  fireEvent.click(card.getByRole('button', { name: `Expand: ${withImages.images![0].alt}` }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()

  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('shows a placeholder frame for a project with no captures', () => {
  render(<App />)

  for (const project of projects.filter((p) => !p.images?.length)) {
    const card = within(screen.getByRole('article', { name: project.name }))
    expect(card.getByText(/capture pending/i)).toBeInTheDocument()
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

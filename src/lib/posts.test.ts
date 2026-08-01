import { getPost, posts } from './posts'

test('never picks up the underscore-prefixed template', () => {
  expect(posts.map((post) => post.slug)).not.toContain('_template')
})

test('flags posts loaded from content/drafts', () => {
  // Vitest runs with DEV set, so drafts are loaded here the same way `npm run
  // dev` loads them. The production build drops the glob entirely.
  expect(posts.some((post) => post.draft)).toBe(true)
  expect(posts.every((post) => typeof post.draft === 'boolean')).toBe(true)
})

test('orders posts newest first', () => {
  const dates = posts.map((post) => post.date)
  expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
})

test('numbers posts oldest-first so a number is stable as new posts land', () => {
  const numbers = posts.map((post) => post.number)
  expect(numbers).toEqual([...numbers].sort((a, b) => b - a))
  expect(Math.min(...numbers, Infinity)).toBe(posts.length === 0 ? Infinity : 1)
})

test('looks a post up by slug and misses cleanly', () => {
  expect(getPost('does-not-exist')).toBeUndefined()

  const [first] = posts
  if (first) expect(getPost(first.slug)).toBe(first)
})

test('every post carries the metadata the pages render', () => {
  for (const post of posts) {
    expect(post.title).toBeTruthy()
    expect(post.description).toBeTruthy()
    expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(post.category).toBeTruthy()
  }
})

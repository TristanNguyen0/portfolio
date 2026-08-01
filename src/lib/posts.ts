import type { ComponentType } from 'react'
import type { CategorySlug } from '../data/categories'

/** The front matter every post file exports. */
export interface PostMeta {
  title: string
  description: string
  /** YYYY-MM-DD. Compared as a string, so no timezone ever enters into it. */
  date: string
  category: CategorySlug
}

export interface Post extends PostMeta {
  /** Filename without the extension. */
  slug: string
  /** Display index — oldest post is 1 — shown in the index rows. */
  number: number
  /** True for anything under content/drafts. Derived, never declared. */
  draft: boolean
  Content: ComponentType
}

interface PostModule {
  meta: PostMeta
  default: ComponentType
}

// Every .tsx in content/posts is published. The leading underscore is the
// opt-out: _template.tsx exists to be copied, not published.
const published = import.meta.glob<PostModule>(['../content/posts/*.tsx', '!../content/posts/_*.tsx'], {
  eager: true,
})

// Drafts render on `npm run dev` and are compiled out of the production build
// entirely — the ternary collapses to `{}` at build time and Rollup drops the
// files with it, so an unfinished post never ships even as dead bytes.
const drafts: Record<string, PostModule> = import.meta.env.DEV
  ? import.meta.glob<PostModule>('../content/drafts/*.tsx', { eager: true })
  : {}

function slugOf(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1).replace(/\.tsx$/, '')
}

function load(modules: Record<string, PostModule>, draft: boolean): Omit<Post, 'number'>[] {
  return Object.entries(modules).map(([path, module]) => ({
    ...module.meta,
    slug: slugOf(path),
    draft,
    Content: module.default,
  }))
}

export const posts: Post[] = [...load(published, false), ...load(drafts, true)]
  // Numbered oldest-first so a post keeps its number as newer ones land, then
  // flipped so the index reads newest at the top.
  .sort((a, b) => a.date.localeCompare(b.date))
  .map((post, index) => ({ ...post, number: index + 1 }))
  .reverse()

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

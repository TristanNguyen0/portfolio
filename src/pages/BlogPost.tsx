import { useEffect, useRef, useState } from 'react'
import Link from '../components/Link'
import { categoriesBySlug } from '../data/categories'
import { formatDate } from '../lib/formatDate'
import type { Post } from '../lib/posts'

interface Heading {
  id: string
  text: string
  level: number
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'section'
  )
}

export default function BlogPost({ post }: { post: Post }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<Heading[]>([])
  const category = categoriesBySlug.get(post.category)
  const { Content } = post

  // The contents list is derived from the rendered body and the ids are stamped
  // on here, so a post never has to declare or maintain its own outline.
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return

    const seen = new Set<string>()

    setHeadings(
      Array.from(body.querySelectorAll('h2, h3')).flatMap((element) => {
        const text = element.textContent?.trim() ?? ''
        if (!text) return []

        const base = slugify(text)
        let id = base
        for (let n = 2; seen.has(id); n += 1) id = `${base}-${n}`
        seen.add(id)

        element.id = id
        return [{ id, text, level: element.tagName === 'H2' ? 2 : 3 }]
      }),
    )
  }, [post.slug])

  const hasContents = headings.length > 0

  return (
    // The post uses the same plain centred column as every other page, so its edges
    // line up with the header. The rail is hung in the margin beside that column
    // rather than being a grid track, because a track would push the column right
    // and break that alignment. The `rail` breakpoint is where the margin fits it.
    <div className="page">
      <div className="column relative">
        {hasContents && (
          <aside className="absolute top-0 right-full mr-16 hidden h-full w-50 rail:block">
            <nav aria-label="Contents" className="sticky top-24">
              <p className="text-xs font-medium uppercase tracking-widest text-faint">Contents</p>
              <ul className="mt-4 space-y-2 text-sm">
                {headings.map((heading) => (
                  <li key={heading.id} className={heading.level === 3 ? 'pl-3' : undefined}>
                    <a
                      href={`#${heading.id}`}
                      className="block text-neutral-400 transition-colors hover:text-neutral-200"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        <Link href="/blog" className="text-sm text-neutral-400 transition-colors hover:text-neutral-200">
          ← All posts
        </Link>

        <header className="mt-8">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-lg text-neutral-400">{post.description}</p>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-neutral-400">
            {category && (
              <>
                <span className={`h-1 w-1 rounded-full ${category.dotClassName}`} />
                {category.title}
                <span aria-hidden="true">·</span>
              </>
            )}
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.draft && <span className="font-mono text-xs text-tomorrow-orange">DRAFT</span>}
          </p>
        </header>

        {/* Shows exactly when the rail does not, so the outline is never missing. */}
        {hasContents && (
          <details className="mt-10 rounded-lg border border-neutral-700 px-4 py-3 rail:hidden">
            <summary className="cursor-pointer text-xs font-medium uppercase tracking-widest text-neutral-400">
              Contents
            </summary>
            <ul className="mt-3 space-y-2 text-sm">
              {headings.map((heading) => (
                <li key={heading.id} className={heading.level === 3 ? 'pl-3' : undefined}>
                  <a href={`#${heading.id}`} className="text-neutral-400 transition-colors hover:text-neutral-100">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div ref={bodyRef} className="prose mt-12">
          <Content />
        </div>

        <div className="mt-20 border-t border-neutral-800/80 pt-6">
          <Link href="/blog" className="text-sm text-neutral-400 transition-colors hover:text-neutral-200">
            ← All posts
          </Link>
        </div>
      </div>
    </div>
  )
}

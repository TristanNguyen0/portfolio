import Link from '../components/Link'
import { categoriesBySlug } from '../data/categories'
import { formatDate } from '../lib/formatDate'
import { posts } from '../lib/posts'

export default function BlogIndex() {
  return (
    <div className="page">
      <div className="column">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Personal Projects, Development Progress, and other musings.
        </h1>

        {posts.length === 0 ? (
          <p className="mt-16 text-sm text-faint">Nothing published yet — the first post is still in drafts.</p>
        ) : (
          <ul className="mt-16 border-t border-neutral-800/80">
            {posts.map((post) => {
              const category = categoriesBySlug.get(post.category)

              return (
                <li key={post.slug} className="border-b border-neutral-800/80">
                  {/* Hovering used to fade the whole row to 60%, which dimmed the thing
                      being pointed at and pushed its text under AA. A light surface
                      lift reads as "this is the target" without touching legibility.
                      The negative margin lets the tint breathe past the text without
                      shifting any of it. */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group -mx-4 flex items-baseline gap-5 rounded-lg px-4 py-6 transition-colors hover:bg-neutral-900/70"
                  >
                    <span className="font-mono text-xs text-faint">{String(post.number).padStart(2, '0')}</span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-neutral-100">
                        {post.title}
                        {post.draft && (
                          <span className="ml-2 font-mono text-[0.65rem] text-tomorrow-orange">DRAFT</span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm text-neutral-400">{post.description}</span>
                      <span className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                        {category && (
                          <>
                            <span className={`h-1 w-1 rounded-full ${category.dotClassName}`} />
                            {category.title}
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                      </span>
                    </span>

                    {/* Nudging the arrow on hover points at where the click leads. */}
                    <span
                      aria-hidden="true"
                      className="text-faint transition-all group-hover:translate-x-1 group-hover:text-tomorrow-orange"
                    >
                      →
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

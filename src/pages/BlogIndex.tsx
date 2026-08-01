import Link from '../components/Link'
import { categoriesBySlug } from '../data/categories'
import { formatDate } from '../lib/formatDate'
import { posts } from '../lib/posts'

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Personal Projects, Development Progress, and other musings.</h1>
      {/* <p className="mt-3 text-neutral-400">
      
      </p> */}

      {posts.length === 0 ? (
        <p className="mt-16 text-sm text-neutral-600">Nothing published yet — the first post is still in drafts.</p>
      ) : (
        <ul className="mt-16 border-t border-neutral-800/80">
          {posts.map((post) => {
            const category = categoriesBySlug.get(post.category)

            return (
              <li key={post.slug} className="border-b border-neutral-800/80">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-baseline gap-5 py-6 transition-opacity hover:opacity-60"
                >
                  <span className="font-mono text-xs text-neutral-600">{String(post.number).padStart(2, '0')}</span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-neutral-100">
                      {post.title}
                      {post.draft && <span className="ml-2 font-mono text-[0.65rem] text-tomorrow-orange">DRAFT</span>}
                    </span>
                    <span className="mt-1 block text-sm text-neutral-400">{post.description}</span>
                    <span className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
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

                  <span
                    aria-hidden="true"
                    className="text-neutral-600 transition-colors group-hover:text-neutral-200"
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
  )
}

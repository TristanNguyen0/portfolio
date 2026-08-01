import LeetCodeDashboard from '../components/LeetCodeDashboard'
import Link from '../components/Link'
import { categories } from '../data/categories'

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Tristan Nguyen</h1>
      <p className="mt-3 text-lg text-neutral-400">
        Software Engineer | Computer Science Graduate, TMU '26 | JavaScript/TypeScript, React, Node.js, Python, AWS, Docker
      </p>

      <div className="mt-16 space-y-10">
        {categories.map((category) => (
          <section key={category.slug}>
            <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-neutral-500">
              <span className={`h-1.5 w-1.5 rounded-full ${category.dotClassName}`} />
              {category.title}
              {category.status &&
                (category.href ? (
                  <Link
                    href={category.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-neutral-800 px-2 py-0.5 text-[0.65rem] font-normal normal-case tracking-normal text-neutral-500 transition-colors hover:border-neutral-700 hover:text-neutral-300"
                  >
                    {category.status}
                  </Link>
                ) : (
                  <span className="rounded-full border border-neutral-800 px-2 py-0.5 text-[0.65rem] font-normal normal-case tracking-normal text-neutral-500">
                    {category.status}
                  </span>
                ))}
            </h2>
            <p className="mt-2 text-neutral-300">{category.body}</p>
          </section>
        ))}

        <LeetCodeDashboard />
      </div>

      <p className="mt-24 text-sm text-neutral-600">
        I write most of this up as I go —{' '}
        <Link href="/blog" className="text-neutral-400 transition-colors hover:text-neutral-200">
          read the notes
        </Link>
        .
      </p>
    </div>
  )
}

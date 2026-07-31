import { formatDate } from '../lib/formatDate'
import type { Difficulty, LeetCodeData } from '../lib/leetcode'
import { useLeetCodeData } from '../lib/useLeetCodeData'

export type { Difficulty, SolvedProblem, LeetCodeData } from '../lib/leetcode'

const difficultyClassName: Record<Difficulty, string> = {
  Easy: 'text-tomorrow-green',
  Medium: 'text-tomorrow-yellow',
  Hard: 'text-tomorrow-orange',
}

/** Reads live data from the Worker; falls back to the bundled snapshot. */
export default function LeetCodeDashboard() {
  return <LeetCodeDashboardView data={useLeetCodeData()} />
}

/** Pure renderer, kept separate so it can be tested without any fetching. */
export function LeetCodeDashboardView({ data }: { data: LeetCodeData }) {
  const solved = [...data.solved].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  const total = data.totals.easy + data.totals.medium + data.totals.hard

  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-neutral-500">
        <span className="h-1.5 w-1.5 rounded-full bg-tomorrow-orange" />
        LeetCode
      </h2>

      <p className="mt-2 text-neutral-300">
        <span className="font-medium text-neutral-100">{total}</span> solved —{' '}
        <span className={difficultyClassName.Easy}>{data.totals.easy} Easy</span>,{' '}
        <span className={difficultyClassName.Medium}>{data.totals.medium} Medium</span>,{' '}
        <span className={difficultyClassName.Hard}>{data.totals.hard} Hard</span>
      </p>

      {solved.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-600">Recent solves will show up here.</p>
      ) : (
        <ul
          aria-label="Solved problems"
          className="mt-3 max-h-72 divide-y divide-neutral-800/80 overflow-y-auto rounded-lg border border-neutral-800/80"
        >
          {solved.map((p) => (
            <li key={p.titleSlug} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
              <div className="min-w-0">
                <a
                  href={`https://leetcode.com/problems/${p.titleSlug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-neutral-200 transition-colors hover:text-tomorrow-orange"
                >
                  {p.title}
                </a>
                <span className={`text-xs ${difficultyClassName[p.difficulty]}`}>{p.difficulty}</span>
              </div>
              <time dateTime={p.completedAt} className="shrink-0 text-sm text-neutral-500">
                {formatDate(p.completedAt)}
              </time>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2 text-xs text-neutral-600">
        Updated {formatDate(data.updatedAt)} ·{' '}
        <a
          href={`https://leetcode.com/u/${data.username}/`}
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-tomorrow-orange"
        >
          @{data.username}
        </a>
      </p>
    </section>
  )
}

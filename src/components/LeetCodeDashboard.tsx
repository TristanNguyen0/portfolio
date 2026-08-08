import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { formatDate } from '../lib/formatDate'
import type { Difficulty, LeetCodeData, SolvedProblem } from '../lib/leetcode'
import { useLeetCodeData } from '../lib/useLeetCodeData'

export type { Difficulty, SolvedProblem, LeetCodeData } from '../lib/leetcode'

const difficultyClassName: Record<Difficulty, string> = {
  Easy: 'text-tomorrow-green',
  Medium: 'text-tomorrow-yellow',
  Hard: 'text-tomorrow-orange',
}

/** Slow enough to read a row before it leaves; one cycle scrolls one copy, so the
    speed stays the same whether there are three solves or thirty. */
const DRIFT_SECONDS_PER_ITEM = 4

/** Ceiling on stacked copies, in case a measurement comes back implausibly small. */
const MAX_TICKER_COPIES = 12

/** Reads live data from the Worker; falls back to the bundled snapshot. */
export default function LeetCodeDashboard() {
  return <LeetCodeDashboardView data={useLeetCodeData()} />
}

/**
 * One cycle slides the track up by a single copy, so every copy *below* the first
 * has to keep the panel covered until the cycle ends — that's the +1. With three
 * solves in a 288px panel two copies leave a ~108px blank band at the end of the
 * cycle; this returns three, and the list never shows an end.
 */
function useSeamlessCopies(panel: RefObject<HTMLElement | null>, copy: RefObject<HTMLElement | null>, itemCount: number) {
  const [copies, setCopies] = useState(2)

  useLayoutEffect(() => {
    const panelEl = panel.current
    const copyEl = copy.current
    if (!panelEl || !copyEl) return

    const fit = () => {
      const copyHeight = copyEl.offsetHeight
      // Zero while the layout is still pending, and always zero under jsdom.
      if (!copyHeight) return
      setCopies(Math.min(MAX_TICKER_COPIES, Math.max(2, 1 + Math.ceil(panelEl.clientHeight / copyHeight))))
    }

    fit()
    // Row heights move with the font and the panel with the viewport, so remeasure
    // rather than trusting a single reading taken at mount.
    const observer = new ResizeObserver(fit)
    observer.observe(panelEl)
    observer.observe(copyEl)
    return () => observer.disconnect()
  }, [panel, copy, itemCount])

  return copies
}

/** Pure renderer, kept separate so it can be tested without any fetching. */
export function LeetCodeDashboardView({ data }: { data: LeetCodeData }) {
  const solved = [...data.solved].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  const total = data.totals.easy + data.totals.medium + data.totals.hard

  const panelRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLUListElement>(null)
  const copies = useSeamlessCopies(panelRef, copyRef, solved.length)

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
        <div
          ref={panelRef}
          className="ticker scrollbar-subtle mt-3 max-h-72 rounded-lg border border-neutral-800/80"
          style={
            {
              '--ticker-duration': `${solved.length * DRIFT_SECONDS_PER_ITEM}s`,
              '--ticker-shift': `${100 / copies}%`,
            } as CSSProperties
          }
        >
          <div className="ticker-track">
            {Array.from({ length: copies }, (_, i) => (
              <SolvedList key={i} solved={solved} clone={i > 0} listRef={i === 0 ? copyRef : undefined} />
            ))}
          </div>
        </div>
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

/**
 * Every copy after the first exists only to fill the loop, so it is hidden from
 * assistive tech and pulled out of the tab order — screen readers and keyboards
 * see one list however many copies the panel needs.
 */
function SolvedList({
  solved,
  clone = false,
  listRef,
}: {
  solved: SolvedProblem[]
  clone?: boolean
  listRef?: RefObject<HTMLUListElement | null>
}) {
  return (
    <ul
      ref={listRef}
      aria-label={clone ? undefined : 'Solved problems'}
      aria-hidden={clone || undefined}
      className={`divide-y divide-neutral-800/80 ${clone ? 'ticker-clone border-t border-neutral-800/80' : ''}`}
    >
      {solved.map((p) => (
        <li key={p.titleSlug} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
          <div className="min-w-0">
            <a
              href={`https://leetcode.com/problems/${p.titleSlug}/`}
              target="_blank"
              rel="noreferrer"
              tabIndex={clone ? -1 : undefined}
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
  )
}

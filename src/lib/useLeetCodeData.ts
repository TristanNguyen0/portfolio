import { useEffect, useState } from 'react'
import snapshot from '../data/leetcode.json'
import type { LeetCodeData } from './leetcode'

/** Committed at build time, so the dashboard renders instantly and never flashes empty. */
export const BUNDLED_SNAPSHOT = snapshot as LeetCodeData

/**
 * Renders the bundled snapshot immediately, then swaps in whatever the Worker
 * has in KV once it answers.
 *
 * There is no loading state on purpose: the snapshot is real data, so a spinner
 * would only add a layout shift. If /api/leetcode fails the snapshot simply
 * stays — worst case the dashboard is stale, never broken.
 */
export function useLeetCodeData(fallback: LeetCodeData = BUNDLED_SNAPSHOT): LeetCodeData {
  const [data, setData] = useState(fallback)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const res = await fetch('/api/leetcode', { signal: controller.signal })
        if (!res.ok) return
        setData((await res.json()) as LeetCodeData)
      } catch {
        // Aborted, offline, or the Worker has no data yet. Keep the snapshot.
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  return data
}

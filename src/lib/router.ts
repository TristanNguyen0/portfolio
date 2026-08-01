import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('popstate', onChange)
  }
}

/** Current pathname, without a trailing slash (except for the root). */
export function usePathname(): string {
  return useSyncExternalStore(
    subscribe,
    () => normalizePath(window.location.pathname),
    () => '/',
  )
}

export function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

export function navigate(to: string): void {
  const path = normalizePath(to)

  // Re-clicking the current route (the header logo, mostly) should behave like
  // the old "#top" anchor rather than stacking identical history entries.
  if (path !== normalizePath(window.location.pathname)) {
    window.history.pushState(null, '', path)
    for (const listener of listeners) listener()
  }

  window.scrollTo(0, 0)
}

/** True for anything the browser should handle itself: mailto:, https://, targets. */
export function isExternal(href: string): boolean {
  return !href.startsWith('/')
}

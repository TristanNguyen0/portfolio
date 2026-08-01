import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { isExternal, navigate } from '../lib/router'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/**
 * Renders a real <a> — right-click, middle-click and cmd-click keep working —
 * but takes over plain left clicks on internal paths so the page doesn't reload.
 */
export default function Link({ href, onClick, ...rest }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)

    const opensElsewhere =
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      rest.target === '_blank'

    if (isExternal(href) || opensElsewhere) return

    event.preventDefault()
    navigate(href)
  }

  return <a href={href} onClick={handleClick} {...rest} />
}

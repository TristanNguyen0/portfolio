import { techColors, techLabel, techPaths, type TechName } from '../data/techPaths'

/**
 * One stack badge. Colour comes from the caller so the icon can still be used
 * monochrome somewhere else; TechBadge is what applies the brand colour.
 *
 * No <svg><title>: the name is shown by TechBadge's own tooltip, and a title
 * here would stack the browser's native one on top of it after a delay.
 */
export function TechIcon({ name, className = 'h-4 w-4' }: { name: TechName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} role="img" aria-label={techLabel(name)}>
      <path d={techPaths[name]} />
    </svg>
  )
}

/**
 * The icon plus the label that reveals on hover. Deliberately not focusable:
 * twelve decorative badges would add twelve tab stops to the home page, and the
 * name is already on the icon's aria-label for anyone not using a pointer.
 */
export function TechBadge({ name }: { name: TechName }) {
  return (
    <span className="tech-badge relative flex">
      {/* Brand colour, held slightly back at rest so a row of six marks reads as
          one stack rather than six competing logos, and brought to full on
          hover along with the label. */}
      <TechIcon
        name={name}
        className={`h-4 w-4 opacity-75 transition-opacity hover:opacity-100 ${techColors[name]}`}
      />

      {/* Right-aligned rather than centred so the widest label on the last icon
          in a row still opens inward, instead of off the card and off-screen.
          aria-hidden because the icon's aria-label already says the same thing. */}
      <span
        aria-hidden="true"
        className="tech-label pointer-events-none absolute bottom-full right-0 z-10 mb-2 whitespace-nowrap rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-[0.7rem] text-neutral-200 shadow-lg"
      >
        {techLabel(name)}
      </span>
    </span>
  )
}

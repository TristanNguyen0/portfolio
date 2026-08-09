import type { Project } from '../data/projects'
import { ExternalLinkIcon, GitHubIcon } from './icons'
import { TechBadge } from './techIcons'

const linkIcons = { repo: GitHubIcon, live: ExternalLinkIcon }

/** MMS, QFC — the monogram shown while a project has no capture. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export default function ProjectCard({ project }: { project: Project }) {
  const { name, description, media, mediaAlt, status, links, stack } = project

  // aria-label names the card as a landmark: without it every card is just
  // "article", and its GitHub link is indistinguishable from the site footer's
  // to anyone navigating by role.
  return (
    <article
      aria-label={name}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/30 transition-colors hover:border-neutral-700"
    >
      {/* Fixed 16:9 so the row of cards keeps a common baseline whether or not a
          capture exists yet, and so swapping one in can't shift the layout. */}
      <div className="aspect-video border-b border-neutral-800/80 bg-neutral-950/60">
        {media ? (
          <img
            src={media}
            alt={mediaAlt ?? `${name} in use`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="hatch flex h-full w-full flex-col items-center justify-center gap-2" aria-hidden="true">
            <span className="rounded-md border border-neutral-700 bg-neutral-950 px-2.5 py-1 font-mono text-sm text-neutral-400">
              {initials(name)}
            </span>
            <span className="text-[0.6rem] uppercase tracking-widest text-faint">capture pending</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium text-neutral-100">{name}</h3>
        <p className="mt-1.5 text-sm leading-6 text-neutral-400">{description}</p>

        {/* mt-auto pins the footer to the bottom, so the rules line up across a
            row even when one description runs a line longer than its neighbour. */}
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-neutral-800/80 pt-3">
            {links.length > 0
              ? links.map(({ label, href, kind }) => {
                  const Icon = linkIcons[kind]

                  return (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-tomorrow-orange"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </a>
                  )
                })
              : status && <span className="text-xs text-faint">{status}</span>}

            {/* ml-auto keeps the stack right-aligned, and the wrap drops it onto
                its own line rather than crushing the links at narrow widths. */}
            <ul aria-label={`${name} stack`} className="ml-auto flex items-center gap-2">
              {stack.map((tech) => (
                <li key={tech} className="flex">
                  <TechBadge name={tech} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  )
}

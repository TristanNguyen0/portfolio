// Drives the project grid on the home page. One entry per project; the card
// component reads everything from here, so adding a project is a data change.

import type { TechName } from './techPaths'

export interface ProjectLink {
  label: string
  href: string
  /** Picks the icon and ordering. Repos render first. */
  kind: 'repo' | 'live'
}

export interface Project {
  slug: string
  name: string
  /** Two or three lines at the card's width. Longer than that clips awkwardly. */
  description: string
  /**
   * Imported image or gif showing the project actually running. Cards fall back
   * to a placeholder frame while this is unset, so a project can ship before its
   * capture exists:
   *
   *   import mrMouseStats from '../assets/projects/mr-mouse-stats.gif'
   *   media: mrMouseStats,
   *   mediaAlt: 'Settings history chart for a player over one season',
   */
  media?: string
  mediaAlt?: string
  /** Shown in the footer when there is nothing to link to yet. */
  status?: string
  links: ProjectLink[]
  stack: TechName[]
}

export const projects: Project[] = [
  {
    slug: 'mr-mouse-stats',
    name: 'Mr Mouse Stats',
    description:
      'DPI, in-game sensitivity, and hardware for the pros playing Marvel Rivals in the Ignite circuit. Settings are collected passively from Twitch chat and appended rather than overwritten, so the site shows how a player drifted across a season.',
    links: [{ label: 'GitHub', href: 'https://github.com/TristanNguyen0/mr-mouse-stats', kind: 'repo' }],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Next.js', 'AWS', 'Terraform'],
  },
  {
    slug: 'qmk-web-app',
    name: 'QMK Firmware Customizer',
    description:
      'Build QMK keyboard firmware visually, with no toolchain to install and no C to write. 3,748 keyboards discovered from a pinned QMK tree; each build compiles in a disposable, network-isolated container.',
    status: 'Phase 1 of 6 · not public yet',
    links: [],
    stack: ['TypeScript', 'Next.js', 'Fastify', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
  },
]

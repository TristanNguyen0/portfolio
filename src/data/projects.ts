// Drives the project grid on the home page. One entry per project; the card
// component reads everything from here, so adding a project is a data change.

import mrMouseStatsAdmin from '../assets/projects/mr-mouse-stats/admin-candidates.png'
import mrMouseStatsOverview from '../assets/projects/mr-mouse-stats/overview.png'
import mrMouseStatsPlayers from '../assets/projects/mr-mouse-stats/players.png'
import type { TechName } from './techPaths'

export interface ProjectImage {
  /** Imported from src/assets/projects/, so the build fingerprints it. */
  src: string
  /** Alt text, and the caption under the expanded view. */
  alt: string
}

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
   * Captures of the project actually running. The first fills the card's frame
   * and the rest sit under it as thumbnails; any of them can be expanded. Cards
   * fall back to a placeholder frame while this is unset, so a project can ship
   * before its captures exist:
   *
   *   import mrMouseStats from '../assets/projects/mr-mouse-stats.gif'
   *   images: [{ src: mrMouseStats, alt: 'One player’s settings across a season' }],
   */
  images?: ProjectImage[]
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
    images: [
      { src: mrMouseStatsOverview, alt: 'Overview: eDPI and DPI distributions across the circuit, and the mice in use' },
      { src: mrMouseStatsPlayers, alt: 'Players table: DPI, sensitivity, eDPI, and mouse per player' },
      { src: mrMouseStatsAdmin, alt: 'Admin: chat responses the parser could not structure, resolved by hand' },
    ],
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

// One entry per thing I write about. This drives both the sections on the home
// page and the coloured tag on every blog post, so a category is added once.

import mrMouseStatsAdmin from '../assets/mr-mouse-stats/admin-candidates.png'
import mrMouseStatsOverview from '../assets/mr-mouse-stats/overview.png'
import mrMouseStatsPlayers from '../assets/mr-mouse-stats/players.png'

export type CategorySlug = 'homelab' | 'cad' | 'mr-mouse-stats'

export interface CategoryImage {
  /** Imported from src/assets/, so the build fingerprints it. */
  src: string
  /** Doubles as the caption under the thumbnail. */
  alt: string
}

export interface Category {
  slug: CategorySlug
  /** Section heading on the home page, and the tag shown on a post. */
  title: string
  /** Tailwind background utility for the 6px dot. */
  dotClassName: string
  /** Home page blurb. */
  body: string
  /** Shown as a badge next to the title when set. */
  status?: string
  /** Repo (or other home) for the project — turns the status badge into a link. */
  href?: string
  /** Screenshots shown as a scrollable strip under the blurb. */
  images?: CategoryImage[]
}

export const categories: Category[] = [
  {
    slug: 'homelab',
    title: 'Homelab',
    dotClassName: 'bg-tomorrow-green',
    body: 'Debian server running Jellyfin, Frigate, and a RustDesk relay in Docker, reachable over Tailscale. Notes on what broke and why.',
  },
  {
    slug: 'cad',
    title: 'CAD & 3D printing',
    dotClassName: 'bg-tomorrow-yellow',
    body: 'Custom mice and PC ducting printed in PETG. Design constraints, print settings, and the iterations that warped.',
  },
  {
    slug: 'mr-mouse-stats',
    title: 'Mr Mouse Stats',
    dotClassName: 'bg-tomorrow-purple',
    status: 'In progress',
    href: 'https://github.com/TristanNguyen0/mr-mouse-stats',
    body: 'Mouse settings — DPI, in-game sensitivity, and hardware — for the pros playing Marvel Rivals in the Ignite circuit. Rosters come from the Liquipedia API; the settings themselves are collected passively from Twitch chat, by listening for what the channel bots already answer. Every reading is appended rather than overwritten, so the site can show how a player’s settings drifted over a season instead of just today’s snapshot.',
    images: [
      { src: mrMouseStatsOverview, alt: 'Overview: eDPI and DPI distributions across the circuit, and the mice in use' },
      { src: mrMouseStatsPlayers, alt: 'Players table: DPI, sensitivity, eDPI, and mouse per player' },
      { src: mrMouseStatsAdmin, alt: 'Admin: chat responses the parser could not structure, resolved by hand' },
    ],
  },
]

export const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]))

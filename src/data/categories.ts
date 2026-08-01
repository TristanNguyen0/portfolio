// One entry per thing I write about. This drives both the sections on the home
// page and the coloured tag on every blog post, so a category is added once.

export type CategorySlug = 'homelab' | 'cad' | 'mr-mouse-stats'

export interface Category {
  slug: CategorySlug
  /** Section heading on the home page, and the tag shown on a post. */
  title: string
  /** Tailwind background utility for the 6px dot. */
  dotClassName: string
  /** Tailwind text utility, used for hover states on links in this category. */
  textClassName: string
  /** Home page blurb. */
  body: string
  /** Shown as a badge next to the title when set. */
  status?: string
}

export const categories: Category[] = [
  {
    slug: 'homelab',
    title: 'Homelab',
    dotClassName: 'bg-tomorrow-green',
    textClassName: 'text-tomorrow-green',
    body: 'Debian server running Jellyfin, Frigate, and a RustDesk relay in Docker, reachable over Tailscale. Notes on what broke and why.',
  },
  {
    slug: 'cad',
    title: 'CAD & 3D printing',
    dotClassName: 'bg-tomorrow-yellow',
    textClassName: 'text-tomorrow-yellow',
    body: 'Custom mice and PC ducting printed in PETG. Design constraints, print settings, and the iterations that warped.',
  },
  {
    slug: 'mr-mouse-stats',
    title: 'Mr Mouse Stats',
    dotClassName: 'bg-tomorrow-purple',
    textClassName: 'text-tomorrow-purple',
    status: 'In progress',
    body: 'Mouse settings — DPI, in-game sensitivity, and hardware — for the pros playing Marvel Rivals in the Ignite circuit. Rosters come from the Liquipedia API; the settings themselves are collected passively from Twitch chat, by listening for what the channel bots already answer. Every reading is appended rather than overwritten, so the site can show how a player’s settings drifted over a season instead of just today’s snapshot.',
  },
]

export const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]))

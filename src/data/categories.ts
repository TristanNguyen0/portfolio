// One entry per thing I write about. This drives both the sections on the home
// page and the coloured tag on every blog post, so a category is added once.

export type CategorySlug = 'homelab' | 'cad' | 'claude-watch'

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
    slug: 'claude-watch',
    title: 'Claude usage on Sensor Watch',
    dotClassName: 'bg-tomorrow-purple',
    textClassName: 'text-tomorrow-purple',
    status: 'In progress',
    body: "An open-source watch face that puts Claude usage on my wrist. A small service polls Anthropic's usage APIs and pushes the current window to a Sensor Watch Pro, which buzzes when a limit is close to spent and again when the window resets. The rest of the time its custom LCD just shows the percentage used, so checking costs a glance instead of a terminal.",
  },
]

export const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]))

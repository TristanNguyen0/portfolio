const links = [
  { label: 'GitHub', href: 'https://github.com/TristanNguyen0' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/tristan-nguyen0' },
  { label: 'Email', href: 'mailto:tristann0708@gmail.com' },
]

const sections = [
  {
    title: 'Software',
    body: 'Full-stack TypeScript, Docker, AWS. Currently building a queued job runner with retries, error classification, and a public run dashboard.',
  },
  {
    title: 'Homelab',
    body: 'Debian server running Jellyfin, Frigate, and a RustDesk relay in Docker, reachable over Tailscale. Notes on what broke and why.',
  },
  {
    title: 'CAD & 3D printing',
    body: 'Custom mice and PC ducting printed in PETG. Design constraints, print settings, and the iterations that warped.',
  },
]

export default function App() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="text-4xl font-semibold tracking-tight">Tristan Nguyen</h1>
        <p className="mt-3 text-lg text-neutral-400">
          Software engineer. Toronto. I build things that run in production and
          the physical objects that sit next to them.
        </p>

        <nav className="mt-6 flex gap-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-neutral-300 underline underline-offset-4 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="mt-16 space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-sm font-medium uppercase tracking-widest text-neutral-500">
                {s.title}
              </h2>
              <p className="mt-2 text-neutral-300">{s.body}</p>
            </section>
          ))}
        </div>

        <footer className="mt-24 text-sm text-neutral-600">
          Writing and project pages coming shortly.
        </footer>
      </div>
    </main>
  )
}
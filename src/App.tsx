import Header from './components/Header'
import Footer from './components/Footer'
import LeetCodeDashboard from './components/LeetCodeDashboard'

const sections = [
  {
    title: 'Software',
    accentClassName: 'bg-tomorrow-blue',
    body: 'Full-stack TypeScript, Docker, AWS. Currently building a queued job runner with retries, error classification, and a public run dashboard.',
  },
  {
    title: 'Homelab',
    accentClassName: 'bg-tomorrow-green',
    body: 'Debian server running Jellyfin, Frigate, and a RustDesk relay in Docker, reachable over Tailscale. Notes on what broke and why.',
  },
  {
    title: 'CAD & 3D printing',
    accentClassName: 'bg-tomorrow-yellow',
    body: 'Custom mice and PC ducting printed in PETG. Design constraints, print settings, and the iterations that warped.',
  },
]

export default function App() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-24">
          <h1 className="text-4xl font-semibold tracking-tight">Tristan Nguyen</h1>
          <p className="mt-3 text-lg text-neutral-400">
            Software Engineer | Computer Science Graduate, TMU '26 | JavaScript/TypeScript, React, Node.js, Python, AWS, Docker
          </p>

          <div className="mt-16 space-y-10">
            {sections.map((s) => (
              <section key={s.title}>
                <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-neutral-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.accentClassName}`} />
                  {s.title}
                </h2>
                <p className="mt-2 text-neutral-300">{s.body}</p>
              </section>
            ))}

            <LeetCodeDashboard />
          </div>

          <p className="mt-24 text-sm text-neutral-600">Writing and project pages coming shortly.</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

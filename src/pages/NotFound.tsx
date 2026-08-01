import Link from '../components/Link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Nothing here</h1>
      <p className="mt-3 text-neutral-400">That page doesn't exist — it may have been renamed or never published.</p>

      <div className="mt-10 flex gap-5 text-sm">
        <Link href="/" className="text-neutral-300 transition-colors hover:text-neutral-100">
          Home
        </Link>
        <Link href="/blog" className="text-neutral-300 transition-colors hover:text-neutral-100">
          All posts
        </Link>
      </div>
    </div>
  )
}

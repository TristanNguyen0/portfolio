// TNlogo.png is a dark mark on an opaque white 500x500 canvas, 72% of which is
// blank. TNlogo-mark.png is that file cropped to its artwork (x131-398, y178-321)
// with the white dropped to transparent and the ink recoloured neutral-50, so it
// needs no filter here and keeps its native 1.86:1 shape.
import logo from '../assets/TNlogo-mark.png'
import { socialLinks } from '../data/links'
import Link from './Link'

export default function Header() {
  return (
    // The bar itself stays full-bleed so the border and blur run edge to edge, but
    // its contents sit in the same column as the page body — otherwise the logo
    // lands ~150px inside the shell edge but outside where the body text starts.
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur">
      <div className="shell">
        <div className="column flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <img src={logo} alt="Tristan Nguyen logo" className="h-8 w-auto" />
            <span className="font-semibold tracking-tight text-neutral-100">Tristan Nguyen</span>
          </Link>

          <nav className="flex items-center gap-5">
            <Link href="/blog" className="text-sm text-neutral-400 transition-colors hover:text-neutral-100">
              Blog
            </Link>

            <span aria-hidden="true" className="h-4 w-px bg-neutral-800" />

            {socialLinks.map(({ label, href, Icon, hoverClassName }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className={`text-neutral-400 transition-colors ${hoverClassName}`}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

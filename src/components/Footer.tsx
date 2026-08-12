import logo from '../assets/TNlogo-mark.png'
import { socialLinks } from '../data/links'
import Link from './Link'

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800/80">
      <div className="shell flex flex-col items-center gap-5 py-12 text-center">
        <Link href="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Tristan Nguyen logo" className="h-6 w-auto" />
          <span className="text-sm font-medium text-neutral-300">Tristan Nguyen</span>
        </Link>

        <nav className="flex items-center gap-5">
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

        <p className="text-xs text-faint">
          <Link href="/blog" className="transition-colors hover:text-neutral-200">
            Blog
          </Link>
          <span aria-hidden="true" className="mx-2">
            ·
          </span>
          © {new Date().getFullYear()} Tristan Nguyen. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

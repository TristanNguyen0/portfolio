import logo from '../assets/logo.svg'
import { socialLinks } from '../data/links'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-3">
          <img src={logo} alt="Tristan Nguyen logo" className="h-8 w-8 object-contain" />
          <span className="font-semibold tracking-tight text-neutral-100">Tristan Nguyen</span>
        </a>

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
      </div>
    </header>
  )
}

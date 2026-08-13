import type { CategoryImage } from '../data/categories'

/**
 * A scrollable strip of screenshots. Thumbnails are far too small to read at
 * this column width, so each one links to the full-size file — the strip is a
 * preview, the click is the actual look.
 */
export default function Screenshots({ images, label }: { images: CategoryImage[]; label: string }) {
  return (
    <ul
      aria-label={`${label} screenshots`}
      className="scrollbar-subtle -mx-6 mt-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-3"
    >
      {images.map((image) => (
        <li key={image.src} className="w-72 shrink-0 snap-start">
          <a
            href={image.src}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-lg border border-neutral-800/80 transition-colors hover:border-neutral-700"
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="w-full rounded-lg bg-neutral-950 opacity-90 transition-opacity group-hover:opacity-100"
            />
          </a>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">{image.alt}</p>
        </li>
      ))}
    </ul>
  )
}

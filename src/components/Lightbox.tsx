import { useCallback, useEffect } from 'react'
import type { ProjectImage } from '../data/projects'

/**
 * Full-size view of one capture, over the page. A card's frame is ~370px wide,
 * which is nowhere near enough to read a dashboard screenshot — the card is the
 * preview and this is the actual look, so it gets the whole viewport.
 *
 * Closes on Escape, on the backdrop, or on the button; arrow keys walk the set.
 */
export default function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: ProjectImage[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const image = images[index]
  // Wraps, so holding one arrow key never dead-ends on the first or last shot.
  const step = useCallback(
    (delta: number) => onIndexChange((index + delta + images.length) % images.length),
    [index, images.length, onIndexChange],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }

    document.addEventListener('keydown', onKeyDown)
    // The page behind must not scroll while the overlay owns the viewport.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [onClose, step])

  return (
    // The backdrop is the click target and the figure stops the event, so a click
    // anywhere off the image closes without needing to hit-test the gaps.
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-neutral-950/95 p-4 sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 cursor-pointer rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-100"
      >
        Close
      </button>

      <figure onClick={(event) => event.stopPropagation()} className="flex min-h-0 flex-col items-center">
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-[75vh] w-auto max-w-full rounded-lg border border-neutral-800 object-contain"
        />
        <figcaption className="mt-3 max-w-2xl text-center text-sm text-neutral-400">{image.alt}</figcaption>
      </figure>

      {images.length > 1 && (
        <div onClick={(event) => event.stopPropagation()} className="flex items-center gap-4 text-sm text-neutral-400">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous screenshot"
            className="cursor-pointer rounded-full border border-neutral-700 px-3 py-1 transition-colors hover:border-neutral-500 hover:text-neutral-100"
          >
            ‹
          </button>
          <span className="tabular-nums text-faint">
            {index + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next screenshot"
            className="cursor-pointer rounded-full border border-neutral-700 px-3 py-1 transition-colors hover:border-neutral-500 hover:text-neutral-100"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

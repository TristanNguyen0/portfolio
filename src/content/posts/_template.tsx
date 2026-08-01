/*
 * POST TEMPLATE — copy this file, don't edit it.
 *
 * Start a post as a draft:
 *   cp src/content/posts/_template.tsx src/content/drafts/my-post-slug.tsx
 *
 * Publish it by moving it up a directory:
 *   git mv src/content/drafts/my-post-slug.tsx src/content/posts/
 *
 * Anything in content/drafts shows up on `npm run dev` with a DRAFT tag and is
 * compiled out of the deployed build completely — the text never ships. The
 * filename becomes the URL: my-post-slug.tsx → /blog/my-post-slug. Files
 * starting with `_` are skipped, which is why this one never publishes.
 *
 * There is nothing to register — save the file and it shows up on /blog, newest
 * first. The contents sidebar is generated from the <h2>/<h3> below, so don't
 * write one by hand.
 */

import type { PostMeta } from '../../lib/posts'

export const meta: PostMeta = {
  title: 'Title of the post',
  // One line, shown under the title on /blog and at the top of the post.
  description: 'The short version, in a sentence.',
  // YYYY-MM-DD. Sorts the index; also what renders as the date.
  date: '2026-08-01',
  // 'homelab' | 'cad' | 'mr-mouse-stats' — see src/data/categories.ts
  category: 'homelab',
}

export default function Post() {
  return (
    <>
      <p>
        Opening paragraph. Plain JSX — no wrapper components and no class names to remember, the styling comes from
        the <code>.prose</code> rules in <code>src/index.css</code>.
      </p>

      <h2>A section heading</h2>

      <p>
        Inline bits: <strong>bold</strong>, <code>inline code</code>, and{' '}
        <a href="https://example.com" target="_blank" rel="noreferrer">
          a link
        </a>
        . Watch out for apostrophes — in JSX, write <code>{'{"don\'t"}'}</code> or use the &rsquo; entity.
      </p>

      <h3>A sub-heading</h3>

      <ul>
        <li>Bulleted list item</li>
        <li>Another one</li>
      </ul>

      <ol>
        <li>Numbered list item</li>
        <li>Another one</li>
      </ol>

      {/* Wrap the code in a template literal so braces and quotes pass through untouched. */}
      <pre>
        <code>{`docker compose logs -f frigate
# ...`}</code>
      </pre>

      <blockquote>A pulled-out quote, or a warning worth slowing down for.</blockquote>

      {/* Put images in src/assets/ and import them at the top:
          import diagram from '../../assets/diagram.png' */}
      <figure>
        <img src="https://placehold.co/1200x630/0a0a0a/525252/png" alt="Describe the image for screen readers" />
        <figcaption>Caption under the image.</figcaption>
      </figure>

      {/* Wide tables: wrap in <div className="overflow-x-auto"> so they scroll on mobile. */}
      <table>
        <thead>
          <tr>
            <th>Setting</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nozzle</td>
            <td>245&nbsp;°C</td>
          </tr>
          <tr>
            <td>Bed</td>
            <td>80&nbsp;°C</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <p>Closing thought.</p>
    </>
  )
}

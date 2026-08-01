# [tristannguyen.ca](https://tristannguyen.ca/)

Personal website.

## Writing a blog post

Posts are `.tsx` files. Copy the template into
the drafts folder:

```sh
cp src/content/posts/_template.tsx src/content/drafts/my-post-slug.tsx
```

The filename is the URL, so that becomes `/blog/my-post-slug`. Each file exports
`meta` (title, description, `YYYY-MM-DD` date, category) and a default component
whose body is plain JSX — `<p>`, `<h2>`, `<ul>`, `<pre>` and friends are styled
by the `.prose` rules in `src/index.css`, so there is nothing to import or wrap.

Publish by moving the file up a directory:

```sh
git mv src/content/drafts/my-post-slug.tsx src/content/posts/
```

Anything under `src/content/drafts/` renders on `npm run dev` with a DRAFT tag
and is compiled out of the production build entirely — the text never reaches
the deployed bundle. Files starting with `_` are always skipped, which is why
the template itself never publishes.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server, drafts visible |
| `npm test` | Vitest suite |
| `npm run lint` | ESLint |
| `npm run build` | Typecheck + production build |
| `npm run worker:dev` | Build, then run the Cloudflare Worker locally |
| `npm run sync:leetcode` | Refresh `src/data/leetcode.json` from LeetCode |

// Merges recent accepted LeetCode submissions into src/data/leetcode.json.
// LeetCode's GraphQL API only exposes the ~20 most recent accepted submissions,
// so run this periodically (npm run sync:leetcode) and commit the result to
// accumulate history beyond that window.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const DATA_PATH = fileURLToPath(new URL('../src/data/leetcode.json', import.meta.url))
const GRAPHQL_URL = 'https://leetcode.com/graphql'

async function graphql(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join('; '))
  return json.data
}

const data = JSON.parse(await readFile(DATA_PATH, 'utf8'))
const before = JSON.stringify({ totals: data.totals, solved: data.solved })

const { recentAcSubmissionList, matchedUser } = await graphql(
  `query ($username: String!) {
    recentAcSubmissionList(username: $username, limit: 20) { title titleSlug timestamp }
    matchedUser(username: $username) {
      submitStats { acSubmissionNum { difficulty count } }
    }
  }`,
  { username: data.username },
)

const counts = Object.fromEntries(
  matchedUser.submitStats.acSubmissionNum.map(({ difficulty, count }) => [difficulty, count]),
)
data.totals = { easy: counts.Easy ?? 0, medium: counts.Medium ?? 0, hard: counts.Hard ?? 0 }

const known = new Set(data.solved.map((s) => s.titleSlug))
const fresh = recentAcSubmissionList.filter((s) => !known.has(s.titleSlug))

for (const sub of fresh) {
  const { question } = await graphql(
    `query ($titleSlug: String!) { question(titleSlug: $titleSlug) { difficulty } }`,
    { titleSlug: sub.titleSlug },
  )
  data.solved.push({
    title: sub.title,
    titleSlug: sub.titleSlug,
    difficulty: question?.difficulty ?? 'Easy',
    completedAt: new Date(Number(sub.timestamp) * 1000).toISOString().slice(0, 10),
  })
}

data.solved.sort((a, b) => b.completedAt.localeCompare(a.completedAt))

// Leave the file byte-identical when nothing actually changed. Bumping
// updatedAt on every run would make the scheduled job commit daily forever.
if (JSON.stringify({ totals: data.totals, solved: data.solved }) === before) {
  console.log('No changes; leetcode.json left untouched.')
  process.exit(0)
}

data.updatedAt = new Date().toISOString().slice(0, 10)

await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + '\n')
console.log(`Synced: ${fresh.length} new solve(s), ${data.solved.length} total in file.`)

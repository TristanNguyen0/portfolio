// Merges recent accepted LeetCode submissions into src/data/leetcode.json.
// LeetCode only exposes the ~20 most recent accepted submissions, so run this
// periodically (npm run sync:leetcode) and commit the result to accumulate
// history beyond that window.
//
// Set LEETCODE_API_BASE to point at a self-hosted alfa-leetcode-api instead of
// the shared public one (120 req/hour per IP, and it cold-starts).
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createLeetCodeClient, fetchLeetCodeData, todayInTimeZone } from '../src/lib/leetcode.ts'

const DATA_PATH = fileURLToPath(new URL('../src/data/leetcode.json', import.meta.url))

const data = JSON.parse(await readFile(DATA_PATH, 'utf8'))
const before = JSON.stringify({ totals: data.totals, solved: data.solved })

const client = createLeetCodeClient({ baseUrl: process.env.LEETCODE_API_BASE })
const { totals, solved } = await fetchLeetCodeData(data.username, data.solved, client)

// Leave the file byte-identical when nothing actually changed. Bumping
// updatedAt on every run would make the scheduled job commit daily forever.
if (JSON.stringify({ totals, solved }) === before) {
  console.log('No changes; leetcode.json left untouched.')
  process.exit(0)
}

const added = solved.length - data.solved.length
const updatedAt = todayInTimeZone()
await writeFile(DATA_PATH, JSON.stringify({ ...data, updatedAt, totals, solved }, null, 2) + '\n')
console.log(`Synced: ${added} new solve(s), ${solved.length} total in file.`)

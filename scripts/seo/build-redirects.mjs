// scripts/seo/build-redirects.mjs
// Merges src/config/legacy-redirects.json into vercel.json "redirects" (all permanent).
// Hand-written redirects already in vercel.json are kept; legacy entries are replaced on every run.
// Usage: node scripts/seo/build-redirects.mjs [--check]   (--check exits 1 if vercel.json is out of date)
import fs from 'node:fs';

const VERCEL = 'vercel.json';
const LEGACY = 'src/config/legacy-redirects.json';
const check = process.argv.includes('--check');

const vercel = JSON.parse(fs.readFileSync(VERCEL, 'utf8'));
const legacy = JSON.parse(fs.readFileSync(LEGACY, 'utf8')).redirects;

const problems = [];
const seen = new Set();
for (const r of legacy) {
  if (!r.source?.startsWith('/') || !r.destination?.startsWith('/')) problems.push(`not a root-relative path: ${JSON.stringify(r)}`);
  if (seen.has(r.source)) problems.push(`duplicate source: ${r.source}`);
  seen.add(r.source);
  if (legacy.some((x) => x.source === r.destination)) problems.push(`chain: ${r.source} -> ${r.destination} is itself redirected`);
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

const legacySources = new Set(legacy.map((r) => r.source));
const kept = (vercel.redirects || []).filter((r) => !legacySources.has(r.source));
const next = [...kept, ...legacy.map(({ source, destination }) => ({ source, destination, permanent: true }))];

const before = JSON.stringify(vercel.redirects || []);
const after = JSON.stringify(next);
if (check) {
  if (before !== after) {
    console.error('vercel.json redirects are out of date: run node scripts/seo/build-redirects.mjs');
    process.exit(1);
  }
  console.log(`vercel.json up to date (${next.length} redirects).`);
} else {
  vercel.redirects = next;
  fs.writeFileSync(VERCEL, JSON.stringify(vercel, null, 2) + '\n');
  console.log(`vercel.json: ${kept.length} hand-written + ${legacy.length} legacy = ${next.length} redirects.`);
}

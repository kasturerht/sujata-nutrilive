#!/usr/bin/env node
/**
 * 🚀 SUJATA NUTRILIVE — Amazon SP-API Rufus/COSMO Listings Patcher
 *
 * PATCHes existing Amazon India listings (title, 5 bullets, generic_keyword)
 * with the COSMO/Rufus-engineered copy authored in:
 *   reports_and_blueprints/2026-11-22-amazon-india-full-catalog-rufus-listings.md
 *
 * SAFETY DESIGN:
 *   - Default mode is DRY-RUN. The script never touches Amazon unless --live is
 *     explicitly passed.
 *   - Even with --live, each SKU is PATCHed one at a time with a 1.5 s gap and
 *     the response is printed. A single failure does not abort the batch.
 *   - PATCH (JSON Patch ops) is used — not PUT — so existing attributes we do
 *     not touch (ingredients, weight, dimensions, price, FSSAI metadata) stay
 *     exactly as Amazon has them today.
 *
 * USAGE:
 *   node scripts/deploy-amazon-rufus-listings.mjs                 # dry-run
 *   node scripts/deploy-amazon-rufus-listings.mjs --dry-run       # dry-run
 *   node scripts/deploy-amazon-rufus-listings.mjs --live          # LIVE PATCH
 *   node scripts/deploy-amazon-rufus-listings.mjs --live --sku=X  # just one SKU
 *
 * ENV (reads .env automatically):
 *   AMAZON_LWA_CLIENT_ID        LWA client id
 *   AMAZON_LWA_CLIENT_SECRET    LWA client secret
 *   AMAZON_REFRESH_TOKEN        Refresh token (long-lived)
 *   AMAZON_SELLER_ID            Seller id (A…)
 *   AMAZON_MARKETPLACE_ID       India = A21TJRUUN4KGV (default)
 *   AMAZON_SP_API_ENDPOINT      Default https://sellingpartnerapi-eu.amazon.com
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// ---------- env loader (matches amazon-ops.mjs convention) ------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ---------- CLI args --------------------------------------------------------
const argv = new Set(process.argv.slice(2));
const LIVE = argv.has('--live');
const DRY = !LIVE || argv.has('--dry-run'); // --dry-run always wins
const singleSku = (() => {
  const a = process.argv.find((s) => s.startsWith('--sku='));
  return a ? a.slice('--sku='.length) : null;
})();

// ---------- Constants -------------------------------------------------------
const CLIENT_ID = process.env.AMAZON_LWA_CLIENT_ID;
const CLIENT_SECRET = process.env.AMAZON_LWA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.AMAZON_REFRESH_TOKEN;
const SELLER_ID = process.env.AMAZON_SELLER_ID;
const MARKETPLACE_ID = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const SP_ENDPOINT = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

// Per-SKU productType. Must match the ASIN's actual catalog classification on
// Amazon.in or the PATCH is rejected. Values sourced from
// scripts/amazon-master-catalog-engine.mjs — the repo's authoritative map.
// HERBAL_SUPPLEMENT: spirulina / sea buckthorn / moringa / combos
// NUTRITIONAL_SUPPLEMENT: plant-based B12 (vitamin product line)
// SKIN_CLEANING_AGENT: SpiruGlow handmade soap bars
// Each TARGETS entry must carry its own productType.

// Full 17-SKU catalog covering the four Phase-1 hero SKUs already patched
// (kept here so the script is idempotent if re-run) plus the thirteen Phase-2
// SKUs. Every ASIN + SKU pair is sourced from scripts/amazon-sales-traffic-
// engine.mjs, the repo's authoritative map, after the founder confirmed it on
// 2026-11-22.
const TARGETS = [
  // ── Phase 1 ──────────────────────────────────────────────────────────────
  { sku: 'L5-UK79-BHXE',           asin: 'B0DP2FWN4J', productType: 'HERBAL_SUPPLEMENT',      name: 'Spirulina Powder 100 g',           anchor: '### B0DP2FWN4J — Sujata Nutrilive Spirulina Powder 100 g' },
  { sku: 'SJT-SP-TAB-120',         asin: 'B0HMJD7SJ9', productType: 'HERBAL_SUPPLEMENT',      name: 'Spirulina Tablets 120 count',      anchor: '### B0HMJD7SJ9 — Sujata Spirulina Tablets 120 count (500 mg × 120)' },
  { sku: '8X-HQKV-14T7',           asin: 'B0DNSXGGTN', productType: 'HERBAL_SUPPLEMENT',      name: 'Spirulina Tablets 60 count',       anchor: '### B0DNSXGGTN — Sujata Spirulina Tablets 60 count (500 mg × 60)' },
  { sku: 'AB01',                   asin: 'B0GMQYS6M4', productType: 'HERBAL_SUPPLEMENT',      name: 'Spirulina Veg Capsules 60 count',  anchor: '### B0GMQYS6M4 — Sujata Spirulina Veg Capsules 60 count (500 mg × 60)' },
  // ── Phase 2 — authoritative mapping from amazon-sales-traffic-engine.mjs ─
  { sku: 'SJT-SP-CAP-120',         asin: 'B0HMJFFVCW', productType: 'HERBAL_SUPPLEMENT',      name: 'Spirulina Veg Capsules 120 count', anchor: '### B0HMJFFVCW — Sujata Spirulina Veg Capsules 120 count (500 mg × 120)' },
  { sku: 'SJT-SP-CAP-180',         asin: 'B0HMJRHQZL', productType: 'HERBAL_SUPPLEMENT',      name: 'Spirulina Veg Capsules 180 count', anchor: '### B0HMJRHQZL — Sujata Spirulina Veg Capsules 180 count (500 mg × 180)' },
  { sku: 'SJT-SB-CAP-60',          asin: 'B0HMJHWLV3', productType: 'HERBAL_SUPPLEMENT',      name: 'Himalayan Sea Buckthorn 60 ct',    anchor: '### B0HMJHWLV3 — Sujata Himalayan Sea Buckthorn Capsules 60 count (650 mg × 60)' },
  { sku: 'SJT-B12-CAP-90',         asin: 'B0HMJDWMSB', productType: 'NUTRITIONAL_SUPPLEMENT', name: 'Plant B12 Capsules 90 ct',         anchor: '### B0HMJDWMSB — Sujata Natural Plant-Based Vitamin B12 Capsules 90 count (3-Month Supply)' },
  { sku: 'SJT-MOR-PWD-100G',       asin: 'B0HMJMYRS5', productType: 'HERBAL_SUPPLEMENT',      name: 'Moringa Leaf Powder 100 g',        anchor: '### B0HMJMYRS5 — Sujata Natural Moringa Leaf Powder 100 g' },
  { sku: 'SJT-SP-SOAP-100G',       asin: 'B0HMJF366D', productType: 'SKIN_CLEANING_AGENT',    name: 'SpiruGlow Bath Soap (single)',     anchor: '### B0HMJF366D — SpiruGlow Handmade Bath Soap 100 g (Single Bar)' },
  { sku: 'SJT-SP-SOAP-5PK',        asin: 'B0HMKR4W22', productType: 'SKIN_CLEANING_AGENT',    name: 'SpiruGlow Bath Soap 5-Pack',       anchor: '### B0HMKR4W22 — SpiruGlow Handmade Bath Soap 5-Pack (100 g × 5)' },
  { sku: 'SJT-SP-SOAP-10PK',       asin: 'B0HMKD5F7N', productType: 'SKIN_CLEANING_AGENT',    name: 'SpiruGlow Bath Soap 10-Pack',      anchor: '### B0HMKD5F7N — SpiruGlow Handmade Bath Soap 10-Pack (100 g × 10)' },
  { sku: 'SJT-COMBO-SP90-SB60',    asin: 'B0HMJNJ2LP', productType: 'HERBAL_SUPPLEMENT',      name: 'Super Immunity Combo (Tab90+SB60)',anchor: '### B0HMJNJ2LP — Super Immunity Combo: Spirulina Tablets 90 + Himalayan Sea Buckthorn 60' },
  { sku: 'SJT-COMBO-SP120-SB60',   asin: 'B0HMKBCF92', productType: 'HERBAL_SUPPLEMENT',      name: 'Mega Synergy Combo (Tab120+SB60)', anchor: '### B0HMKBCF92 — Mega Synergy Combo: Spirulina Tablets 120 + Himalayan Sea Buckthorn 60' },
  { sku: 'SJT-CMBO-HL-1M',         asin: 'B0HMJNHVNH', productType: 'HERBAL_SUPPLEMENT',      name: 'Healthy Life Month 1 Pack',        anchor: '### B0HMJNHVNH — Healthy Life Month 1 Pack' },
  { sku: 'SJT-CMBO-HL-2M',         asin: 'B0HMJRLX2C', productType: 'HERBAL_SUPPLEMENT',      name: 'Healthy Life Month 2 Pack',        anchor: '### B0HMJRLX2C — Healthy Life Month 2 Pack' },
  { sku: 'SJT-CMBO-HL-3M',         asin: 'B0HMJD6LYN', productType: 'HERBAL_SUPPLEMENT',      name: 'Healthy Life Month 3 Pack',        anchor: '### B0HMJD6LYN — Healthy Life Month 3 Pack' }
];

// Amazon.in enforcement
const MAX_TITLE_CHARS = 200;
const MAX_BULLET_CHARS = 500;
const MAX_SEARCH_BYTES = 249;
const REQUIRED_BULLETS = 5;

// ---------- Markdown parser -------------------------------------------------
function readMarkdownReport() {
  const mdPath = path.join(
    rootDir,
    'reports_and_blueprints',
    '2026-11-22-amazon-india-full-catalog-rufus-listings.md'
  );
  if (!fs.existsSync(mdPath)) {
    throw new Error(`Rufus listings markdown not found at: ${mdPath}`);
  }
  return { md: fs.readFileSync(mdPath, 'utf8'), path: mdPath };
}

function extractSection(md, anchor) {
  const start = md.indexOf(anchor);
  if (start < 0) throw new Error(`Section anchor not found: ${anchor}`);
  // Section ends at the next "### " at col 0 or "## " or end-of-file.
  const after = start + anchor.length;
  const nextH3 = md.indexOf('\n### ', after);
  const nextH2 = md.indexOf('\n## ', after);
  const candidates = [nextH3, nextH2].filter((i) => i > 0);
  const end = candidates.length ? Math.min(...candidates) : md.length;
  return md.slice(start, end);
}

function extractFirstCodeBlockAfter(section, heading) {
  const idx = section.indexOf(heading);
  if (idx < 0) throw new Error(`Heading not found in section: ${heading}`);
  const slice = section.slice(idx);
  const m = slice.match(/```\s*\n([\s\S]*?)\n```/);
  if (!m) throw new Error(`No code block found after heading: ${heading}`);
  return m[1].trim();
}

function extractCodeBlocksBetween(section, startHeading, endHeading) {
  const s = section.indexOf(startHeading);
  const e = section.indexOf(endHeading, s);
  if (s < 0) throw new Error(`Heading not found: ${startHeading}`);
  if (e < 0) throw new Error(`Heading not found: ${endHeading}`);
  const slice = section.slice(s, e);
  const blocks = [];
  const re = /```\s*\n([\s\S]*?)\n```/g;
  let m;
  while ((m = re.exec(slice)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

function parseListingForTarget(md, target) {
  const section = extractSection(md, target.anchor);
  const title = extractFirstCodeBlockAfter(section, '#### Title');
  const bullets = extractCodeBlocksBetween(
    section,
    '#### 5 Rufus-Engineered Bullet Points',
    '#### Backend Search Terms'
  );
  const searchTerms = extractFirstCodeBlockAfter(section, '#### Backend Search Terms');
  return { ...target, title, bullets, searchTerms };
}

// ---------- Validation ------------------------------------------------------
function validate(listing) {
  const errors = [];
  if (!listing.title) errors.push('title is empty');
  if (listing.title && listing.title.length > MAX_TITLE_CHARS) {
    errors.push(`title is ${listing.title.length} chars (>${MAX_TITLE_CHARS})`);
  }
  if (!Array.isArray(listing.bullets) || listing.bullets.length !== REQUIRED_BULLETS) {
    errors.push(`expected ${REQUIRED_BULLETS} bullets, got ${listing.bullets?.length ?? 0}`);
  }
  (listing.bullets || []).forEach((b, i) => {
    if (b.length > MAX_BULLET_CHARS) errors.push(`bullet #${i + 1} is ${b.length} chars (>${MAX_BULLET_CHARS})`);
  });
  if (!listing.searchTerms) errors.push('generic_keyword / search terms is empty');
  if (listing.searchTerms) {
    const bytes = Buffer.byteLength(listing.searchTerms, 'utf8');
    if (bytes > MAX_SEARCH_BYTES) errors.push(`search terms are ${bytes} bytes (>${MAX_SEARCH_BYTES})`);
  }
  return errors;
}

// ---------- PATCH payload builder ------------------------------------------
function buildPatchBody(listing) {
  const marketplace = MARKETPLACE_ID;
  const lang = { language_tag: 'en_IN', marketplace_id: marketplace };
  return {
    productType: listing.productType,
    patches: [
      {
        op: 'replace',
        path: '/attributes/item_name',
        value: [{ ...lang, value: listing.title }]
      },
      {
        op: 'replace',
        path: '/attributes/bullet_point',
        value: listing.bullets.map((b) => ({ ...lang, value: b }))
      },
      {
        op: 'replace',
        path: '/attributes/generic_keyword',
        value: [{ ...lang, value: listing.searchTerms }]
      }
    ]
  };
}

// ---------- SP-API client ---------------------------------------------------
async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Missing LWA env (AMAZON_LWA_CLIENT_ID / AMAZON_LWA_CLIENT_SECRET / AMAZON_REFRESH_TOKEN)');
  }
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }).toString()
  });
  if (!res.ok) throw new Error(`LWA token exchange failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  return json.access_token;
}

async function patchListing(sku, body, token) {
  if (!SELLER_ID) throw new Error('Missing AMAZON_SELLER_ID in env');
  const url =
    `${SP_ENDPOINT}/listings/2021-08-01/items/${encodeURIComponent(SELLER_ID)}/${encodeURIComponent(sku)}` +
    `?marketplaceIds=${MARKETPLACE_ID}&includedData=issues`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-amz-access-token': token,
      'User-Agent': 'SujataNutrilive/1.0 (Language=JavaScript; Deploy=rufus-cosmo-2026-11-22)'
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // keep as text
  }
  return { status: res.status, ok: res.ok, data: data ?? text };
}

// ---------- Output helpers --------------------------------------------------
const bar = (n = 76) => '═'.repeat(n);
const sub = (n = 76) => '─'.repeat(n);
function indent(str, prefix = '  ') {
  return String(str)
    .split('\n')
    .map((l) => prefix + l)
    .join('\n');
}

// ---------- Main ------------------------------------------------------------
async function main() {
  console.log(bar());
  console.log('  SUJATA — Amazon SP-API Rufus/COSMO Listings Patcher');
  console.log(`  Mode: ${DRY ? '🟡 DRY-RUN (no API writes)' : '🔴 LIVE PATCH (writes to Amazon India)'}`);
  console.log(`  Marketplace: ${MARKETPLACE_ID}   Endpoint: ${SP_ENDPOINT}`);
  console.log(`  Seller ID set: ${SELLER_ID ? 'yes' : 'no (required for --live)'}`);
  console.log(`  LWA creds set: ${CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN ? 'yes' : 'no (required for --live)'}`);
  console.log(bar());

  // 1. Parse markdown
  const { md, path: mdPath } = readMarkdownReport();
  console.log(`✅ Read listings source: ${path.relative(rootDir, mdPath)}`);

  const targets = singleSku ? TARGETS.filter((t) => t.sku === singleSku) : TARGETS;
  if (!targets.length) {
    throw new Error(`--sku=${singleSku} did not match any target SKU. Known: ${TARGETS.map((t) => t.sku).join(', ')}`);
  }
  console.log(`✅ Resolved ${targets.length} target SKU(s): ${targets.map((t) => t.sku).join(', ')}`);

  const listings = targets.map((t) => parseListingForTarget(md, t));

  // 2. Validate every listing BEFORE touching the network
  let totalErrors = 0;
  for (const l of listings) {
    const errs = validate(l);
    if (errs.length) {
      totalErrors += errs.length;
      console.log(`❌ ${l.sku} (${l.asin}) — ${errs.length} validation issue(s):`);
      errs.forEach((e) => console.log(`     · ${e}`));
    }
  }
  if (totalErrors > 0) {
    console.log('');
    console.log(`❌ Aborting — ${totalErrors} validation error(s) across ${listings.length} listings.`);
    console.log(`   Fix the markdown report and re-run.`);
    process.exit(2);
  }
  console.log(`✅ All ${listings.length} listings pass Amazon.in limits (title ≤${MAX_TITLE_CHARS}, 5 bullets ≤${MAX_BULLET_CHARS}, keywords ≤${MAX_SEARCH_BYTES} bytes)`);
  console.log('');

  // 3. For each listing: show summary + (dry-run) payload OR (live) PATCH
  let token = null;
  if (!DRY) {
    console.log('🔑 Exchanging refresh token for LWA access token…');
    token = await getAccessToken();
    console.log('✅ Access token acquired');
    console.log('');
  }

  const results = [];
  for (const l of listings) {
    console.log(sub());
    console.log(`SKU: ${l.sku}   ASIN: ${l.asin}`);
    console.log(`Product: ${l.name}`);
    console.log(`  · Title     [${l.title.length} chars]  : ${l.title.slice(0, 96)}${l.title.length > 96 ? '…' : ''}`);
    console.log(`  · Bullets   [${l.bullets.length}]          : ${l.bullets.map((b) => `${b.length}c`).join(', ')}`);
    console.log(`  · Search    [${Buffer.byteLength(l.searchTerms, 'utf8')} bytes] : ${l.searchTerms.slice(0, 96)}${l.searchTerms.length > 96 ? '…' : ''}`);

    const body = buildPatchBody(l);

    if (DRY) {
      console.log('');
      console.log('  ── PATCH payload (dry-run only; nothing was sent) ──');
      console.log(indent(JSON.stringify(body, null, 2), '    '));
      results.push({ sku: l.sku, mode: 'dry-run', status: 'skipped' });
    } else {
      try {
        const res = await patchListing(l.sku, body, token);
        if (res.ok && res.data && (res.data.status === 'ACCEPTED' || res.data.status === 'VALID')) {
          console.log(`  ✅ PATCH accepted. submissionId=${res.data.submissionId || '-'} status=${res.data.status}`);
          if (res.data.issues?.length) {
            console.log(`  ⚠️  Amazon flagged ${res.data.issues.length} issue(s):`);
            res.data.issues.forEach((i) => console.log(`       · [${i.severity}] ${i.code}: ${i.message}`));
          }
          results.push({ sku: l.sku, mode: 'live', status: res.data.status, submissionId: res.data.submissionId });
        } else {
          console.log(`  ⚠️  Unexpected response (HTTP ${res.status}):`);
          console.log(indent(JSON.stringify(res.data, null, 2).slice(0, 2000), '    '));
          results.push({ sku: l.sku, mode: 'live', status: 'error', http: res.status });
        }
      } catch (err) {
        console.log(`  ❌ PATCH failed: ${err.message}`);
        results.push({ sku: l.sku, mode: 'live', status: 'exception', error: err.message });
      }
      await new Promise((r) => setTimeout(r, 1500)); // rate-limit gap
    }
  }

  console.log(sub());
  console.log('');
  console.log(bar());
  console.log('  SUMMARY');
  console.log(bar());
  for (const r of results) {
    console.log(`  ${r.sku.padEnd(16)}  mode=${r.mode.padEnd(8)}  status=${r.status}${r.submissionId ? `  id=${r.submissionId}` : ''}${r.error ? `  err=${r.error}` : ''}`);
  }
  console.log('');
  if (DRY) {
    console.log('  🟡 This was a DRY-RUN. No listings were modified on Amazon.');
    console.log('     To apply these PATCHes live, re-run with:');
    console.log('        node scripts/deploy-amazon-rufus-listings.mjs --live');
    console.log('     Or target a single SKU for a test first:');
    console.log('        node scripts/deploy-amazon-rufus-listings.mjs --live --sku=L5-UK79-BHXE');
  }
  console.log(bar());
}

main().catch((err) => {
  console.error('');
  console.error('❌ Fatal:', err?.stack || err?.message || err);
  process.exit(1);
});

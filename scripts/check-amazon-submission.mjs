#!/usr/bin/env node
/**
 * 🔍 SUJATA NUTRILIVE — Amazon SP-API Submission Status Checker
 *
 * For every SKU patched by `scripts/deploy-amazon-rufus-listings.mjs`, this
 * utility calls:
 *   GET /listings/2021-08-01/items/{sellerId}/{sku}
 *       ?marketplaceIds={mp}&includedData=summaries,issues
 * and prints a single-row-per-SKU table with:
 *   - the live listing status (VALID / INVALID / DISCOVERABLE / etc.)
 *   - a count of unresolved issues
 *   - the specific issue codes/messages so they fit on screen
 *
 * Why this and not a "get submission by id" endpoint?
 *   SP-API Listings Items 2021-08-01 does not expose a dedicated
 *   submission-status endpoint. The submissionId returned by PATCH is a
 *   receipt. The authoritative place to read the OUTCOME is the listing
 *   itself: `summaries[].status` carries the post-validation state and
 *   `issues[]` carries anything Amazon flagged. The receipts we recorded
 *   on the deploy run are kept in this file so the status table can
 *   cross-reference them, but they are not queried by their own URL.
 *
 * USAGE:
 *   node scripts/check-amazon-submission.mjs                 # all 17
 *   node scripts/check-amazon-submission.mjs --sku=L5-UK79-BHXE   # one
 *   node scripts/check-amazon-submission.mjs --json          # JSON report
 *   node scripts/check-amazon-submission.mjs --issues-only   # only rows with issues
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// ---- env loader (matches amazon-ops.mjs convention) -----------------------
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

// ---- CLI args -------------------------------------------------------------
const argv = new Set(process.argv.slice(2));
const JSON_OUT = argv.has('--json');
const ISSUES_ONLY = argv.has('--issues-only');
const singleSku = (() => {
  const a = process.argv.find((s) => s.startsWith('--sku='));
  return a ? a.slice('--sku='.length) : null;
})();

// ---- Constants ------------------------------------------------------------
const CLIENT_ID = process.env.AMAZON_LWA_CLIENT_ID;
const CLIENT_SECRET = process.env.AMAZON_LWA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.AMAZON_REFRESH_TOKEN;
const SELLER_ID = process.env.AMAZON_SELLER_ID;
const MARKETPLACE_ID = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const SP_ENDPOINT = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

// 17 SKUs + their last known PATCH submissionIds, from the 2026-11-22 live
// run of scripts/deploy-amazon-rufus-listings.mjs. Kept here as a receipt
// cross-reference only; status is derived from the live GET, not from these.
const TARGETS = [
  { sku: 'L5-UK79-BHXE',         asin: 'B0DP2FWN4J', name: 'Spirulina Powder 100 g',           lastSubmissionId: '57c6194e569f493abdf73c3b0b806948' },
  { sku: 'SJT-SP-TAB-120',       asin: 'B0HMJD7SJ9', name: 'Spirulina Tablets 120',            lastSubmissionId: '471c4f1a25ad4d1c9a427cc8eecd3aba' },
  { sku: '8X-HQKV-14T7',         asin: 'B0DNSXGGTN', name: 'Spirulina Tablets 60',             lastSubmissionId: '82a73efdaf6d42f8a28af87a51be41f7' },
  { sku: 'AB01',                 asin: 'B0GMQYS6M4', name: 'Spirulina Caps 60',                lastSubmissionId: '2a419c7d908d4749b9a6ff5fc3b1b697' },
  { sku: 'SJT-SP-CAP-120',       asin: 'B0HMJFFVCW', name: 'Spirulina Caps 120',               lastSubmissionId: '13bedc1f12a442d48a46a0a802022fe4' },
  { sku: 'SJT-SP-CAP-180',       asin: 'B0HMJRHQZL', name: 'Spirulina Caps 180',               lastSubmissionId: '43b691f9983844e19fe28b6ec7208caf' },
  { sku: 'SJT-SB-CAP-60',        asin: 'B0HMJHWLV3', name: 'Himalayan Sea Buckthorn 60',       lastSubmissionId: '81ce146c2ca74ec7a50ef47023fb1f58' },
  { sku: 'SJT-B12-CAP-90',       asin: 'B0HMJDWMSB', name: 'Plant B12 Caps 90 (3-month)',      lastSubmissionId: 'd956da2c5ec04e9396ba3e5ed33fc609' },
  { sku: 'SJT-MOR-PWD-100G',     asin: 'B0HMJMYRS5', name: 'Moringa Leaf Powder 100 g',        lastSubmissionId: '69a0699780004c2989da4eca0092afe3' },
  { sku: 'SJT-SP-SOAP-100G',     asin: 'B0HMJF366D', name: 'SpiruGlow Soap (single)',          lastSubmissionId: '0304d4406a9a40e98626101cd8816b62' },
  { sku: 'SJT-SP-SOAP-5PK',      asin: 'B0HMKR4W22', name: 'SpiruGlow Soap 5-Pack',            lastSubmissionId: 'af9c890a8dc4403bab735d47d9a0350c' },
  { sku: 'SJT-SP-SOAP-10PK',     asin: 'B0HMKD5F7N', name: 'SpiruGlow Soap 10-Pack',           lastSubmissionId: '34aacb3fbfd641ada6d2b64678cd813a' },
  { sku: 'SJT-COMBO-SP90-SB60',  asin: 'B0HMJNJ2LP', name: 'Super Immunity (T90+SB60)',        lastSubmissionId: 'f516bf420e18434592ccbe593590c952' },
  { sku: 'SJT-COMBO-SP120-SB60', asin: 'B0HMKBCF92', name: 'Mega Synergy (T120+SB60)',         lastSubmissionId: 'bdff0c2841e24dd9a4fc8b5914cc33a0' },
  { sku: 'SJT-CMBO-HL-1M',       asin: 'B0HMJNHVNH', name: 'Healthy Life Month 1',             lastSubmissionId: '1122be99948f483eac3f314ea88a4f93' },
  { sku: 'SJT-CMBO-HL-2M',       asin: 'B0HMJRLX2C', name: 'Healthy Life Month 2',             lastSubmissionId: 'd6cbf020e19d4e0f877ed2b1a74d9eca' },
  { sku: 'SJT-CMBO-HL-3M',       asin: 'B0HMJD6LYN', name: 'Healthy Life Month 3',             lastSubmissionId: '15983365c28d47eb9c49f3ff3e63db40' }
];

// ---- SP-API client --------------------------------------------------------
async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Missing LWA env (AMAZON_LWA_CLIENT_ID / _CLIENT_SECRET / _REFRESH_TOKEN)');
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

async function getListing(sku, token) {
  if (!SELLER_ID) throw new Error('Missing AMAZON_SELLER_ID in env');
  const url =
    `${SP_ENDPOINT}/listings/2021-08-01/items/${encodeURIComponent(SELLER_ID)}/${encodeURIComponent(sku)}` +
    `?marketplaceIds=${MARKETPLACE_ID}&includedData=summaries,issues`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'x-amz-access-token': token,
      'User-Agent': 'SujataNutrilive/1.0 (Language=JavaScript; Op=status-check-2026-11-22)'
    }
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* keep raw */ }
  return { status: res.status, ok: res.ok, data: data ?? text };
}

// ---- Shape helpers --------------------------------------------------------
function extractStatus(data) {
  // summaries is an array; take the first matching the marketplace
  const summaries = data?.summaries ?? [];
  const match = summaries.find((s) => s.marketplaceId === MARKETPLACE_ID) || summaries[0];
  if (!match) return { listingStatus: '-', itemName: '-' };
  return {
    listingStatus: Array.isArray(match.status) ? match.status.join(',') : (match.status ?? '-'),
    itemName: match.itemName ?? '-',
    productType: match.productType ?? '-',
    createdDate: match.createdDate ?? '-',
    lastUpdatedDate: match.lastUpdatedDate ?? '-'
  };
}

function extractIssues(data) {
  const issues = data?.issues ?? [];
  // group by severity
  const bySeverity = { ERROR: [], WARNING: [], INFO: [] };
  for (const i of issues) {
    const bucket = bySeverity[i.severity] || bySeverity.INFO;
    bucket.push(i);
  }
  return {
    total: issues.length,
    errors: bySeverity.ERROR.length,
    warnings: bySeverity.WARNING.length,
    info: bySeverity.INFO.length,
    all: issues
  };
}

function statusGlyph(summary, issues) {
  const s = (summary.listingStatus || '').toUpperCase();
  if (issues.errors > 0) return '❌';
  if (issues.warnings > 0) return '⚠️ ';
  if (s.includes('DISCOVERABLE') || s === 'ACTIVE' || s === 'VALID') return '✅';
  if (s.includes('BUYABLE')) return '✅';
  return '•';
}

// ---- Output ---------------------------------------------------------------
const bar = (n = 108) => '═'.repeat(n);
const sub = (n = 108) => '─'.repeat(n);

function printRow(target, summary, issues, httpStatus) {
  const glyph = statusGlyph(summary, issues);
  const sku = (target.sku || '-').padEnd(21);
  const asin = (target.asin || '-').padEnd(11);
  const stat = (summary.listingStatus || '-').padEnd(22);
  const err = String(issues.errors).padStart(3);
  const warn = String(issues.warnings).padStart(3);
  const nameTrunc = (target.name || '-').slice(0, 32).padEnd(32);
  console.log(`${glyph} ${sku}  ${asin}  ${stat}  err:${err}  warn:${warn}  http:${httpStatus}  ${nameTrunc}`);
  if (issues.total > 0) {
    for (const i of issues.all) {
      const sev = `[${i.severity || '?'}]`.padEnd(10);
      const code = (i.code || '?').padEnd(28);
      const msg = (i.message || '').replace(/\s+/g, ' ').slice(0, 200);
      const path = i.attributeNames?.length ? ` (${i.attributeNames.join(',')})` : '';
      console.log(`   ${sev} ${code} ${msg}${path}`);
    }
  }
}

// ---- Main ------------------------------------------------------------------
async function main() {
  const picks = singleSku ? TARGETS.filter((t) => t.sku === singleSku) : TARGETS;
  if (!picks.length) {
    throw new Error(`--sku=${singleSku} did not match any known SKU`);
  }

  if (!JSON_OUT) {
    console.log(bar());
    console.log('  SUJATA — Amazon SP-API Submission Status Checker');
    console.log(`  Marketplace: ${MARKETPLACE_ID}   Endpoint: ${SP_ENDPOINT}`);
    console.log(`  SKUs to check: ${picks.length}`);
    console.log(bar());
    console.log('');
  }

  const token = await getAccessToken();
  if (!JSON_OUT) {
    console.log('✅ Access token acquired');
    console.log('');
    console.log(sub());
    console.log('  SKU                    ASIN         Status                   Issues              HTTP   Product');
    console.log(sub());
  }

  const report = [];
  let okCount = 0, errCount = 0, warnCount = 0;
  for (const t of picks) {
    let result;
    try {
      result = await getListing(t.sku, token);
    } catch (err) {
      const row = { ...t, http: 0, error: err.message, listingStatus: '-', issues: { total: 0, errors: 0, warnings: 0, info: 0, all: [] } };
      report.push(row);
      if (!JSON_OUT) console.log(`❌ ${t.sku.padEnd(21)}  ${t.asin.padEnd(11)}  (fetch failed)        err:  0  warn:  0  http:  0  ${t.name}`);
      await new Promise((r) => setTimeout(r, 400));
      continue;
    }

    const summary = extractStatus(result.data);
    const issues = extractIssues(result.data);
    const row = {
      sku: t.sku,
      asin: t.asin,
      name: t.name,
      lastSubmissionId: t.lastSubmissionId,
      http: result.status,
      listingStatus: summary.listingStatus,
      itemName: summary.itemName,
      productType: summary.productType,
      lastUpdatedDate: summary.lastUpdatedDate,
      issues
    };
    report.push(row);

    if (issues.errors > 0) errCount++;
    else if (issues.warnings > 0) warnCount++;
    else okCount++;

    if (!JSON_OUT && !(ISSUES_ONLY && issues.total === 0)) {
      printRow(t, summary, issues, result.status);
    }
    await new Promise((r) => setTimeout(r, 400)); // ~2.5 req/sec — under 5 req/sec limit
  }

  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(sub());
  console.log('');
  console.log(bar());
  console.log('  SUMMARY');
  console.log(bar());
  console.log(`  Clean (no issues)      : ${okCount}/${picks.length}`);
  console.log(`  With WARNING issues    : ${warnCount}/${picks.length}`);
  console.log(`  With ERROR issues      : ${errCount}/${picks.length}`);
  console.log('');
  console.log('  Legend: ✅ clean · ⚠️  Amazon flagged warnings (listing still live) · ❌ Amazon flagged errors (fix required)');
  console.log(bar());
}

main().catch((err) => {
  console.error('');
  console.error('❌ Fatal:', err?.stack || err?.message || err);
  process.exit(1);
});

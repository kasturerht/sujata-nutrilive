// scripts/audit-gsc-indexing-status.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Google OAuth2 Token
async function getGoogleToken(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = b64(header) + '.' + b64(payload);
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const assertion = signInput + '.' + signer.sign(key.private_key, 'base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OAuth error: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function main() {
  console.log('================================================================');
  console.log('🔍 GOOGLE SEARCH CONSOLE: COMPLETE URL INDEXING FORENSIC AUDIT');
  console.log('================================================================\n');

  const token = await getGoogleToken([
    'https://www.googleapis.com/auth/webmasters',
    'https://www.googleapis.com/auth/webmasters.readonly'
  ]);
  console.log('✅ Google API Token Acquired!');

  const siteUrl = 'https://www.sujatanutrilive.com/';

  // 1. Fetch Sitemaps Status from GSC
  console.log('\n--- 1. GSC SITEMAPS STATUS ---');
  try {
    const sitemapsRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sitemapsData = await sitemapsRes.json();
    console.log('Sitemaps in GSC:', JSON.stringify(sitemapsData, null, 2));
  } catch(e) {
    console.log('Sitemaps error:', e.message);
  }

  // 2. Fetch all URLs from live sitemap
  console.log('\n--- 2. FETCHING LIVE SITEMAP URLS ---');
  let allUrls = [];
  try {
    const smRes = await fetch('https://www.sujatanutrilive.com/sitemap-0.xml');
    if (smRes.ok) {
      const xml = await smRes.text();
      allUrls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
    }
  } catch(e) {
    console.log('Error fetching sitemap:', e.message);
  }
  console.log(`Found ${allUrls.length} total URLs in sitemap.`);

  // 3. Inspect URLs using Google URL Inspection API
  console.log('\n--- 3. GOOGLE URL INSPECTION API (REAL-TIME INDEX STATUS) ---');
  const results = [];

  for (let i = 0; i < allUrls.length; i++) {
    const url = allUrls[i];
    try {
      const inspectRes = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inspectionUrl: url,
          siteUrl: siteUrl
        })
      });

      const inspectData = await inspectRes.json();
      if (inspectRes.ok) {
        const idx = inspectData.inspectionResult?.indexStatusResult;
        const verdict = idx?.verdict || 'UNKNOWN';
        const coverageState = idx?.coverageState || 'UNKNOWN';
        const lastCrawlTime = idx?.lastCrawlTime || 'Never';
        const indexingState = idx?.indexingState || 'UNKNOWN';
        const robotsTxtState = idx?.robotsTxtState || 'UNKNOWN';

        results.push({
          url,
          verdict,
          coverageState,
          lastCrawlTime,
          indexingState,
          robotsTxtState
        });

        const icon = verdict === 'PASS' ? '🟢 [INDEXED]' : (coverageState.includes('Crawled') ? '🟡 [CRAWLED - NOT INDEXED]' : '🔴 [' + coverageState + ']');
        console.log(`${i + 1}/${allUrls.length} ${icon} ${url}`);
        console.log(`     Coverage: ${coverageState} | Last Crawl: ${lastCrawlTime}`);
      } else {
        console.log(`⚠️ Inspect error for ${url}:`, inspectData.error?.message || JSON.stringify(inspectData));
        results.push({ url, verdict: 'ERROR', error: inspectData.error?.message });
        if (inspectData.error?.code === 429) {
          console.log('Rate limit reached on URL Inspection API.');
          break;
        }
      }
    } catch(err) {
      console.log(`Error inspecting ${url}:`, err.message);
    }
    // Respect rate limits (URL Inspection API quota is 2000/day, ~600/minute)
    await new Promise(r => setTimeout(r, 600));
  }

  // 4. Summarize
  console.log('\n================================================================');
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('================================================================');
  const indexed = results.filter(r => r.verdict === 'PASS');
  const pending = results.filter(r => r.verdict !== 'PASS');

  console.log(`Total URLs Checked: ${results.length}`);
  console.log(`✅ Fully Indexed (PASS): ${indexed.length}`);
  console.log(`⏳ Pending / Excluded / Not Indexed: ${pending.length}\n`);

  if (pending.length > 0) {
    console.log('--- DETAILS OF PENDING / NOT INDEXED PAGES ---');
    pending.forEach(p => {
      console.log(`- ${p.url}: ${p.coverageState} (Last Crawl: ${p.lastCrawlTime})`);
    });
  }

  fs.writeFileSync('scripts/gsc_indexing_audit_result.json', JSON.stringify({ indexed, pending, all: results }, null, 2));
}

main().catch(console.error);

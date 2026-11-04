// scripts/deep-gsc-and-live-schema-audit.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Google OAuth Token
const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

function getGoogleJwt(scopes, key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: Array.isArray(scopes) ? scopes.join(' ') : scopes,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = b64(header) + '.' + b64(payload);
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  return signInput + '.' + signer.sign(key.private_key, 'base64url');
}

async function getGoogleToken() {
  const assertion = getGoogleJwt(['https://www.googleapis.com/auth/webmasters'], key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(JSON.stringify(data));
  return data.access_token;
}

// 2. Fetch Sitemap URLs
async function getSitemapUrls() {
  const res = await fetch('https://www.sujatanutrilive.com/sitemap-0.xml');
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  return urls;
}

// 3. Live HTML Schema Validator
function validateHtmlSchema(url, html) {
  const issues = [];
  const detectedTypes = [];

  // Check Canonical Tag
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;
  if (!canonical) {
    issues.push({ severity: 'ERROR', code: 'MISSING_CANONICAL', message: 'No canonical link found in HTML' });
  } else if (canonical !== url && canonical !== url + '/' && canonical + '/' !== url) {
    issues.push({ severity: 'WARNING', code: 'CANONICAL_MISMATCH', message: `Canonical (${canonical}) differs from URL (${url})` });
  }

  // Check Robots meta
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  if (robotsMatch && (robotsMatch[1].includes('noindex') || robotsMatch[1].includes('none'))) {
    issues.push({ severity: 'CRITICAL', code: 'NOINDEX_TAG', message: `Robots tag blocks indexing: ${robotsMatch[1]}` });
  }

  // Extract all application/ld+json scripts
  const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  const jsonBlocks = [];

  while ((match = scriptRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      jsonBlocks.push(parsed);
    } catch (e) {
      issues.push({ severity: 'CRITICAL', code: 'MALFORMED_JSON_LD', message: `Invalid JSON-LD syntax: ${e.message}` });
    }
  }

  // Flatten graph items
  const allItems = [];
  jsonBlocks.forEach(b => {
    if (b['@graph'] && Array.isArray(b['@graph'])) {
      allItems.push(...b['@graph']);
    } else {
      allItems.push(b);
    }
  });

  const productItems = [];

  allItems.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    const rawType = item['@type'];
    const types = Array.isArray(rawType) ? rawType : [rawType];
    detectedTypes.push(...types);

    // Deep check for itemReviewed inside Review
    if (types.includes('Review')) {
      if (item.itemReviewed) {
        issues.push({
          severity: 'CRITICAL_ERROR',
          code: 'DIRECTIONAL_CONFLICT_ITEM_REVIEWED',
          message: `Review #${idx + 1} contains 'itemReviewed' field! Causes GSC directional conflict.`
        });
      }
      if (!item.author || (!item.author.name && typeof item.author !== 'string')) {
        issues.push({ severity: 'WARNING', code: 'REVIEW_MISSING_AUTHOR', message: `Review #${idx + 1} missing author.name` });
      }
    }

    // Product Entity Checks
    if (types.includes('Product')) {
      productItems.push(item);
      const name = item.name || 'Unnamed Product';

      // Rule: Either 'offers', 'review', or 'aggregateRating' should be specified
      if (!item.offers && !item.review && !item.aggregateRating) {
        issues.push({
          severity: 'CRITICAL_ERROR',
          code: 'PRODUCT_MISSING_OFFERS_OR_REVIEWS',
          message: `Product "${name}" lacks offers, review, and aggregateRating (GSC Invalid Item error).`
        });
      }

      // Check Offers details
      if (item.offers) {
        const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
        offers.forEach((off, offIdx) => {
          if (off['@type'] === 'Offer' || off['@type'] === 'AggregateOffer') {
            const price = off.price || off.lowPrice;
            if (!price) {
              issues.push({ severity: 'ERROR', code: 'OFFER_MISSING_PRICE', message: `Offer #${offIdx + 1} in "${name}" missing price/lowPrice` });
            }
            if (!off.priceCurrency) {
              issues.push({ severity: 'ERROR', code: 'OFFER_MISSING_CURRENCY', message: `Offer #${offIdx + 1} in "${name}" missing priceCurrency` });
            }
            if (!off.availability) {
              issues.push({ severity: 'WARNING', code: 'OFFER_MISSING_AVAILABILITY', message: `Offer #${offIdx + 1} in "${name}" missing availability` });
            }
          }
        });
      }

      // Check image, sku, brand
      if (!item.image) {
        issues.push({ severity: 'WARNING', code: 'PRODUCT_MISSING_IMAGE', message: `Product "${name}" missing image` });
      }
      if (!item.brand) {
        issues.push({ severity: 'WARNING', code: 'PRODUCT_MISSING_BRAND', message: `Product "${name}" missing brand` });
      }
    }
  });

  return {
    valid: issues.filter(i => i.severity.includes('ERROR') || i.severity.includes('CRITICAL')).length === 0,
    issues,
    detectedTypes: [...new Set(detectedTypes)],
    productCount: productItems.length,
    canonical
  };
}

async function auditSingleUrl(url, token, siteUrl) {
  const result = {
    url,
    httpStatus: 0,
    liveSchema: null,
    gscInspection: null,
    status: 'UNKNOWN'
  };

  // 1. Live Fetch & Schema Check
  try {
    const res = await fetch(url);
    result.httpStatus = res.status;
    const html = await res.text();
    result.liveSchema = validateHtmlSchema(url, html);
  } catch (e) {
    result.httpStatus = 500;
    result.liveSchema = { valid: false, issues: [{ severity: 'CRITICAL', code: 'FETCH_FAILED', message: e.message }] };
  }

  // 2. Google Search Console Inspection API
  try {
    const gscRes = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
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
    const gscData = await gscRes.json();
    if (gscRes.ok) {
      const idx = gscData.inspectionResult?.indexStatusResult || {};
      const rich = gscData.inspectionResult?.richResultsResult || null;
      result.gscInspection = {
        verdict: idx.verdict || 'NEUTRAL',
        coverageState: idx.coverageState || 'UNKNOWN',
        indexingState: idx.indexingState || 'UNKNOWN',
        robotsTxtState: idx.robotsTxtState || 'UNKNOWN',
        pageFetchState: idx.pageFetchState || 'UNKNOWN',
        richResults: rich
      };
    } else {
      result.gscInspection = { error: gscData.error?.message || 'GSC API Error' };
    }
  } catch (e) {
    result.gscInspection = { error: e.message };
  }

  // Determine overall status
  const hasLiveErrors = result.liveSchema?.issues?.some(i => i.severity.includes('ERROR') || i.severity.includes('CRITICAL'));
  const isIndexed = result.gscInspection?.coverageState?.toLowerCase().includes('indexed') && !result.gscInspection?.coverageState?.toLowerCase().includes('not indexed');

  if (hasLiveErrors) result.status = 'SCHEMA_ERROR';
  else if (isIndexed) result.status = 'INDEXED_AND_HEALTHY';
  else result.status = 'HEALTHY_PENDING_GOOGLE_INDEX';

  return result;
}

async function main() {
  console.log('================================================================');
  console.log('🚀 COMPREHENSIVE LIVE GSC INSPECTION & SCHEMA AUDIT');
  console.log('================================================================\n');

  const token = await getGoogleToken();
  const siteUrl = 'https://www.sujatanutrilive.com/';
  const urls = await getSitemapUrls();
  console.log(`Found ${urls.length} URLs in sitemap to audit.\n`);

  const results = [];
  let idx = 0;

  for (const u of urls) {
    idx++;
    process.stdout.write(`[${idx}/${urls.length}] Auditing: ${u.replace('https://www.sujatanutrilive.com', '') || '/'} ... `);
    const r = await auditSingleUrl(u, token, siteUrl);
    results.push(r);
    console.log(`[Status: ${r.status} | HTTP: ${r.httpStatus} | GSC: ${r.gscInspection?.coverageState || r.gscInspection?.error}]`);
    // Throttle to respect API limits
    await new Promise(res => setTimeout(res, 500));
  }

  const outPath = path.join(__dirname, 'gsc_full_live_site_audit.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n🎉 Full audit finished! Saved to ${outPath}`);
}

main();

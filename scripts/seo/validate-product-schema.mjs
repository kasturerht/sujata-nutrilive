// scripts/seo/validate-product-schema.mjs
// Validates Product structured data on every /product/ URL in the sitemap against Google's
// merchant-listing requirements, checks offers match the prices the page actually sells at,
// and checks title (<=60) / meta description (<=155) lengths. Optionally adds Google's own view
// of rich results from the URL Inspection API (--inspect).
// Usage: node scripts/seo/validate-product-schema.mjs [--base URL] [--inspect] [--json out.json]
import fs from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'https://www.sujatanutrilive.com').replace(/\/$/, '');
const OUT = arg('--json', null);
const INSPECT = process.argv.includes('--inspect');

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));
const flatten = (x) => Array.isArray(x) ? x.flatMap(flatten) : x && x['@graph'] ? flatten(x['@graph']) : x ? [x] : [];
const typeOf = (n) => [].concat(n['@type'] || []);

const index = await (await fetch(`${BASE}/sitemap-index.xml`)).text();
const urls = [];
for (const m of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const xml = await (await fetch(m[1].replace('https://www.sujatanutrilive.com', BASE))).text();
  urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]).filter((u) => u.includes('/product/')));
}

let inspectFn = null;
if (INSPECT) {
  const { googleToken, gscClient } = await import('./lib/google.mjs');
  inspectFn = gscClient(await googleToken(['https://www.googleapis.com/auth/webmasters.readonly'])).inspect;
}

const results = [];
for (const loc of urls) {
  const html = await (await fetch(loc.replace('https://www.sujatanutrilive.com', BASE))).text();
  const errors = [], warnings = [];
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (title.length > 60) warnings.push(`title ${title.length} chars > 60`);
  if (desc.length > 155) warnings.push(`description ${desc.length} chars > 155`);
  if (!desc) errors.push('missing meta description');

  const nodes = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try { nodes.push(...flatten(JSON.parse(m[1]))); } catch { errors.push('invalid JSON-LD block'); }
  }
  const products = nodes.filter((n) => typeOf(n).includes('Product'));
  if (products.length !== 1) errors.push(`${products.length} Product nodes (expected 1)`);
  const p = products[0] || {};
  if (!p.name) errors.push('Product.name missing');
  if (!p.image || (Array.isArray(p.image) && !p.image.length)) errors.push('Product.image missing');
  if (!p.description) warnings.push('Product.description missing');
  if (!p.brand) warnings.push('Product.brand missing');
  if (!p.sku && !p.mpn && !p.gtin && !p.gtin13) warnings.push('no sku/mpn/gtin');

  const offers = [].concat(p.offers || []).flatMap((o) => typeOf(o).includes('AggregateOffer') ? [o, ...[].concat(o.offers || [])] : [o]);
  const single = offers.filter((o) => !typeOf(o).includes('AggregateOffer'));
  if (!offers.length) errors.push('Product.offers missing');
  for (const o of single) {
    if (!(Number(o.price) > 0)) errors.push(`offer price invalid: ${o.price}`);
    if (o.priceCurrency !== 'INR') errors.push(`offer priceCurrency ${o.priceCurrency}`);
    if (!/schema\.org\/(InStock|OutOfStock|PreOrder|BackOrder|LimitedAvailability)/.test(o.availability || '')) errors.push(`offer availability ${o.availability}`);
    if (o.priceValidUntil && new Date(o.priceValidUntil) < new Date()) errors.push(`priceValidUntil in the past: ${o.priceValidUntil}`);
  }
  const anyOffer = single[0] || offers[0] || {};
  if (!anyOffer.hasMerchantReturnPolicy && !p.hasMerchantReturnPolicy) warnings.push('no hasMerchantReturnPolicy');
  if (!anyOffer.shippingDetails) warnings.push('no shippingDetails');

  // Offers must match prices the page sells at (visible variant buttons / add-to-cart data-price).
  const sold = new Set([...html.matchAll(/data-price="([\d.]+)"/g)].map((m) => Number(m[1])));
  const offered = new Set(single.map((o) => Number(o.price)).filter(Boolean));
  if (sold.size) for (const price of offered) if (!sold.has(price)) errors.push(`schema offers ₹${price} but the page does not sell at that price (page: ${[...sold].join(', ')})`);

  const r = p.aggregateRating;
  if (r) {
    if (!(Number(r.ratingValue) > 0) || !(Number(r.reviewCount || r.ratingCount) > 0)) errors.push(`aggregateRating invalid: ${JSON.stringify(r)}`);
  }
  if (p.review) for (const rv of [].concat(p.review)) if (!rv.author || !rv.reviewRating) errors.push('review missing author or reviewRating');

  let google = null;
  if (inspectFn) {
    const ins = await inspectFn(loc);
    const rr = ins.inspectionResult?.richResultsResult;
    google = rr ? { verdict: rr.verdict, items: (rr.detectedItems || []).map((d) => ({ type: d.richResultType, issues: (d.items || []).flatMap((i) => (i.issues || []).map((x) => `${x.severity}: ${x.issueMessage}`)) })) } : { verdict: ins.inspectionResult?.indexStatusResult?.coverageState || 'n/a' };
  }
  results.push({ url: loc, title, titleLen: title.length, descLen: desc.length, offers: [...offered], sold: [...sold], rating: r ? `${r.ratingValue}/${r.reviewCount || r.ratingCount}` : null, errors, warnings, google });
}

if (OUT) fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
let errorCount = 0;
for (const r of results) {
  errorCount += r.errors.length;
  console.log(`\n${r.errors.length ? 'FAIL' : 'ok  '} ${r.url.replace(BASE, '').replace('https://www.sujatanutrilive.com', '')}  title ${r.titleLen} / desc ${r.descLen}  offers ₹${r.offers.join(',₹')}  rating ${r.rating || '-'}`);
  for (const e of r.errors) console.log(`   ERROR ${e}`);
  for (const w of r.warnings) console.log(`   warn  ${w}`);
  if (r.google) console.log(`   google: ${r.google.verdict}${(r.google.items || []).map((i) => ` | ${i.type}${i.issues.length ? ': ' + i.issues.join('; ') : ''}`).join('')}`);
}
console.log(`\n${results.length} product URLs, ${errorCount} error(s)`);
process.exit(errorCount ? 1 : 0);

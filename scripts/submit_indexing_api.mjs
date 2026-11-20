// scripts/submit_indexing_api.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

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

async function getGoogleToken(scopes) {
  const assertion = getGoogleJwt(scopes, key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const data = await res.json();
  return data.access_token;
}

const targetUrls = [
  'https://www.sujatanutrilive.com/',
  'https://www.sujatanutrilive.com/product/sujata-spirulina-capsules',
  'https://www.sujatanutrilive.com/product/sujata-spirulina-powder',
  'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack',
  'https://www.sujatanutrilive.com/product/sujata-daily-super-immunity-combo',
  'https://www.sujatanutrilive.com/learn/spirulina-tablets-vs-capsules-vs-powder',
  'https://www.sujatanutrilive.com/learn/spirulina-price-in-india-buyers-guide',
  'https://www.sujatanutrilive.com/learn/spirulina-in-marathi',
  'https://www.sujatanutrilive.com/learn/sea-buckthorn-in-hindi',
  'https://www.sujatanutrilive.com/learn/best-spirulina-brand-in-india'
];

async function testGoogleIndexingApi() {
  console.log("=== 1. TESTING GOOGLE INDEXING API ===");
  try {
    const token = await getGoogleToken(['https://www.googleapis.com/auth/indexing']);
    console.log("Google Indexing Token obtained:", !!token);

    for (const url of targetUrls) {
      const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          type: 'URL_UPDATED'
        })
      });
      const data = await res.json();
      console.log(`URL: ${url}`);
      console.log(`Response:`, JSON.stringify(data));
    }
  } catch (err) {
    console.error("Google Indexing API Error:", err.message);
  }
}

async function testGscSitemapRefresh() {
  console.log("\n=== 2. SUBMITTING FRESH SITEMAPS TO GSC API ===");
  try {
    const token = await getGoogleToken([
      'https://www.googleapis.com/auth/webmasters'
    ]);
    const siteUrl = 'https://www.sujatanutrilive.com/';
    const sitemaps = [
      'https://www.sujatanutrilive.com/sitemap-index.xml',
      'https://www.sujatanutrilive.com/sitemap-0.xml'
    ];

    for (const s of sitemaps) {
      const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(s)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Sitemap PUT ${s} -> Status: ${res.status}`);
    }
  } catch (err) {
    console.error("GSC Sitemap Error:", err.message);
  }
}

async function testBingIndexing() {
  console.log("\n=== 3. SUBMITTING TO BING / INDEXNOW API ===");
  const apiKey = env.BING_WEBMASTER_API_KEY;
  if (!apiKey) {
    console.log("No BING_WEBMASTER_API_KEY found.");
    return;
  }
  try {
    const siteUrl = 'https://www.sujatanutrilive.com';
    const res = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteUrl: siteUrl,
        urlList: targetUrls
      })
    });
    const data = await res.json();
    console.log("Bing Submit Batch Response:", JSON.stringify(data));
  } catch (err) {
    console.error("Bing Error:", err.message);
  }
}

async function main() {
  await testGoogleIndexingApi();
  await testGscSitemapRefresh();
  await testBingIndexing();
}

main().catch(console.error);

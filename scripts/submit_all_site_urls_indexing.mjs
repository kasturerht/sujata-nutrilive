// scripts/submit_all_site_urls_indexing.mjs
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

// Fetch all live URLs from sitemap
async function getAllSitemapUrls() {
  try {
    const res = await fetch('https://www.sujatanutrilive.com/sitemap-0.xml');
    const xml = await res.text();
    const matches = xml.match(/<loc>(https:\/\/[^<]+)<\/loc>/g) || [];
    const urls = matches.map(m => m.replace(/<\/?loc>/g, '').trim());
    return [...new Set(urls)];
  } catch (err) {
    console.error("Failed to fetch sitemap:", err.message);
    return [];
  }
}

async function main() {
  console.log("=== BATCH SUBMITTING ALL SITEMAP URLS TO GOOGLE INDEXING API ===");
  const urls = await getAllSitemapUrls();
  console.log(`Found ${urls.length} URLs in live sitemap-0.xml.`);

  // Also include newly created price guide if not yet reflected in live XML
  const additional = [
    'https://www.sujatanutrilive.com/learn/spirulina-price-in-india-buyers-guide',
    'https://www.sujatanutrilive.com/learn/spirulina-side-effects-in-marathi',
    'https://www.sujatanutrilive.com/learn/spirulina-tablets-vs-capsules-vs-powder'
  ];
  additional.forEach(u => {
    if (!urls.includes(u)) urls.push(u);
  });

  const token = await getGoogleToken(['https://www.googleapis.com/auth/indexing']);
  console.log(`Google Indexing Auth Token: OK! Starting submission of ${urls.length} URLs...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const url of urls) {
    try {
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
      if (data.urlNotificationMetadata) {
        console.log(`✅ [SUBMITTED]: ${url}`);
        successCount++;
      } else {
        console.warn(`⚠️ [ISSUE]: ${url} ->`, JSON.stringify(data));
        failCount++;
      }
    } catch (e) {
      console.error(`❌ [ERROR]: ${url} ->`, e.message);
      failCount++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`SUMMARY: ${successCount} URLs submitted successfully | ${failCount} failed.`);
  console.log(`======================================================`);

  // Submit batch to Bing as well
  const apiKey = env.BING_WEBMASTER_API_KEY;
  if (apiKey) {
    try {
      const bRes = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: 'https://www.sujatanutrilive.com',
          urlList: urls
        })
      });
      console.log(`Bing Webmaster batch response: status ${bRes.status}`);
    } catch(e) {
      console.error("Bing submit error:", e.message);
    }
  }
}

main().catch(console.error);

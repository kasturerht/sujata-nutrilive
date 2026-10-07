// scripts/instant-crawler-ping.mjs
// ⚡ SUJATA NUTRILIVE: INSTANT GOOGLE CRAWLER & INDEXING ENGINE (2026)
// Broadcasts real-time 'URL_UPDATED' pings to Googlebot via Google Indexing API & IndexNow Protocol

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Locate Service Account Credentials
const scriptsDir = __dirname;
const jsonFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.json') && (f.includes('sujata-nutrilive-seo') || f.includes('service-account') || f.includes('credentials')));

if (jsonFiles.length === 0) {
  console.error('❌ Error: No Google Service Account JSON key found in scripts/ directory.');
  process.exit(1);
}

const keyPath = path.join(scriptsDir, jsonFiles[0]);
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[k] = val;
    }
  });
}

const SITE_URL = env.PUBLIC_SITE_URL ? env.PUBLIC_SITE_URL.replace(/\/$/, '') : 'https://sujatanutrilive.com';
const INDEXNOW_KEY = 'sujatanutrilive2026indexer';

// 2. Google OAuth2 JWT Generator
function createJwt(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = base64Url(header) + '.' + base64Url(payload);
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  return signInput + '.' + sign.sign(key.private_key, 'base64url');
}

async function getAccessToken(scopes) {
  const jwt = createJwt(scopes);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OAuth error: ${JSON.stringify(data)}`);
  return data.access_token;
}

// 3. Ping Google Indexing API
async function pingGoogle(url, accessToken) {
  try {
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        type: 'URL_UPDATED'
      })
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, notifyTime: data.urlNotificationMetadata?.latestUpdate?.notifyTime || 'Immediate' };
    } else {
      return { success: false, error: data.error?.message || JSON.stringify(data) };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 4. Ping IndexNow Protocol (Bing, Yandex, AI Engines)
async function pingIndexNow(urls) {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'sujatanutrilive.com',
        key: INDEXNOW_KEY,
        keyLocation: 'https://sujatanutrilive.com/indexnow-key.txt',
        urlList: urls
      })
    });
    return { success: res.ok, status: res.status };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 5. Fetch Sitemaps for batch ping
async function getSiteUrls() {
  try {
    const res = await fetch(`${SITE_URL}/sitemap-0.xml`);
    if (res.ok) {
      const xml = await res.text();
      const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
      if (urls.length > 0) return urls;
    }
  } catch (e) {}

  // Fallback core URLs
  return [
    `${SITE_URL}/`,
    `${SITE_URL}/science`,
    `${SITE_URL}/shop`,
    `${SITE_URL}/product/sujata-spirulina-tablets`,
    `${SITE_URL}/product/sujata-spirulina-capsules`,
    `${SITE_URL}/product/sujata-pure-himalayan-shilajit`,
    `${SITE_URL}/product/sujata-plant-based-vitamin-b12`
  ];
}

async function main() {
  const customUrl = process.argv[2];
  console.log('=============================================================');
  console.log('⚡ SUJATA NUTRILIVE: REAL-TIME CRAWLER DISPATCH PROTOCOL');
  console.log('=============================================================');

  let targetUrls = [];
  if (customUrl && customUrl.startsWith('http')) {
    targetUrls = [customUrl];
    console.log(`🎯 Targeting single URL: ${customUrl}`);
  } else {
    console.log('📡 Fetching all active site URLs from sitemap...');
    targetUrls = await getSiteUrls();
    console.log(`✅ Loaded ${targetUrls.length} pages to invite Googlebot.\n`);
  }

  // A. Authenticate with Google
  let googleToken = null;
  try {
    googleToken = await getAccessToken(['https://www.googleapis.com/auth/indexing']);
  } catch (e) {
    console.error('❌ Failed to authenticate with Google Indexing:', e.message);
    process.exit(1);
  }

  // B. Dispatch Googlebot for each URL
  console.log('🤖 DISPATCHING GOOGLEBOT (Google Web Search Indexing API):');
  let googleSuccessCount = 0;
  for (const url of targetUrls) {
    const result = await pingGoogle(url, googleToken);
    if (result.success) {
      console.log(`  🟢 [INVITED] ${url} (Time: ${result.notifyTime})`);
      googleSuccessCount++;
    } else {
      console.log(`  ⚠️ [FAILED] ${url} -> ${result.error}`);
    }
    // Small polite delay between Google API pings
    await new Promise(r => setTimeout(r, 200));
  }

  // C. Dispatch IndexNow (Bing / AI Crawlers)
  console.log('\n🌐 BROADCASTING TO INDEXNOW (Bing / Yandex / AI Crawlers):');
  const indexNowResult = await pingIndexNow(targetUrls);
  if (indexNowResult.success) {
    console.log(`  🟢 Successfully broadcasted ${targetUrls.length} URLs to Bing & AI Indexing network (Status: ${indexNowResult.status})`);
  } else {
    console.log(`  ⚠️ IndexNow Notice: ${indexNowResult.status || indexNowResult.error}`);
  }

  console.log('\n=============================================================');
  console.log(`🏁 COMPLETED: ${googleSuccessCount}/${targetUrls.length} pages broadcasted to Google crawler.`);
  console.log('=============================================================\n');
}

main();

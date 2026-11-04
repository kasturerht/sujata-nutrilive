// scripts/gsc-sitemap-submit.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

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

async function run() {
  const jwt = createJwt(['https://www.googleapis.com/auth/webmasters']);
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  const siteUrl = encodeURIComponent('https://www.sujatanutrilive.com/');
  
  // 1. List sitemaps
  console.log('Fetching registered sitemaps from GSC...');
  const listRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('List Sitemaps HTTP:', listRes.status);
  const listData = await listRes.json();
  console.log('Current Sitemaps:', JSON.stringify(listData, null, 2));

  // 2. Submit sitemap-index.xml
  const sitemapIndexUrl = encodeURIComponent('https://www.sujatanutrilive.com/sitemap-index.xml');
  const putIndex = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${sitemapIndexUrl}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Submitted sitemap-index.xml HTTP status:', putIndex.status);

  // 3. Submit sitemap-0.xml
  const sitemap0Url = encodeURIComponent('https://www.sujatanutrilive.com/sitemap-0.xml');
  const put0 = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${sitemap0Url}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Submitted sitemap-0.xml HTTP status:', put0.status);
}

run().catch(console.error);

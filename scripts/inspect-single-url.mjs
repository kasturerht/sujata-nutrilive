// scripts/inspect-single-url.mjs
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

async function inspect(url) {
  const jwt = createJwt(['https://www.googleapis.com/auth/webmasters.readonly']);
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

  const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inspectionUrl: url,
      siteUrl: 'https://www.sujatanutrilive.com/'
    })
  });
  const data = await res.json();
  console.log(`\n========================================`);
  console.log(`Inspection for: ${url}`);
  console.log(`Status:`, data.inspectionResult?.indexStatusResult?.verdict || 'N/A');
  console.log(`Coverage:`, data.inspectionResult?.indexStatusResult?.coverageState || 'N/A');
  console.log(`Last Crawl:`, data.inspectionResult?.indexStatusResult?.lastCrawlTime || 'Never');
  console.log(`Referring URLs:`, data.inspectionResult?.indexStatusResult?.referringUrls || []);
  console.log(`Sitemap:`, data.inspectionResult?.indexStatusResult?.sitemap || []);
  console.log(`User Canonical:`, data.inspectionResult?.indexStatusResult?.userCanonical || 'None');
  console.log(`Google Canonical:`, data.inspectionResult?.indexStatusResult?.googleCanonical || 'None');
  console.log(`\n--- RICH RESULTS RESULT ---`);
  console.log(JSON.stringify(data.inspectionResult?.richResultsResult, null, 2));
}

async function main() {
  const target = process.argv[2] || 'https://www.sujatanutrilive.com/product/sujata-spirulina-tablets';
  await inspect(target);
}

main().catch(console.error);

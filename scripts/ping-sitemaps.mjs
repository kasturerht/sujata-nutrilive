// scripts/ping-sitemaps.mjs
import fs from 'fs';
import crypto from 'crypto';

const key = JSON.parse(fs.readFileSync('scripts/sujata-nutrilive-seo-7e48e83a62a6.json', 'utf8'));

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

async function pingSitemaps() {
  const assertion = createJwt(['https://www.googleapis.com/auth/webmasters']);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const data = await res.json();
  const token = data.access_token;
  console.log('✅ Token acquired:', !!token);

  const siteUrl = encodeURIComponent('https://www.sujatanutrilive.com/');
  
  // Submit sitemap-index.xml
  const sitemapUrl = encodeURIComponent('https://www.sujatanutrilive.com/sitemap-index.xml');
  const putRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${sitemapUrl}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('📡 sitemap-index.xml Submit HTTP Status:', putRes.status, putRes.status === 204 ? 'SUCCESS (Submitted to Google)' : await putRes.text());

  // Also submit individual sub-sitemap sitemap-0.xml
  const sitemap0Url = encodeURIComponent('https://www.sujatanutrilive.com/sitemap-0.xml');
  const putRes0 = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/sitemaps/${sitemap0Url}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('📡 sitemap-0.xml Submit HTTP Status:', putRes0.status, putRes0.status === 204 ? 'SUCCESS (Submitted to Google)' : await putRes0.text());
}

pingSitemaps();

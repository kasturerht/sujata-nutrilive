import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

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

async function fetchGscPerformance() {
  const token = await getGoogleToken([
    'https://www.googleapis.com/auth/webmasters',
    'https://www.googleapis.com/auth/webmasters.readonly'
  ]);

  const siteUrl = 'https://www.sujatanutrilive.com/';
  
  // Query Search Analytics API
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const startDate = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  console.log(`Querying GSC Search Analytics from ${startDate} to ${endDate} for ${siteUrl}...`);

  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      rowLimit: 50
    })
  });

  const data = await res.json();
  console.log('Search Analytics Status:', res.status);
  if (data.rows) {
    console.log(`Total queries found: ${data.rows.length}`);
    data.rows.slice(0, 15).forEach((r, i) => {
      console.log(`${i+1}. Query: "${r.keys[0]}" | Page: ${r.keys[1]} | Clicks: ${r.clicks} | Impressions: ${r.impressions} | CTR: ${(r.ctr * 100).toFixed(1)}% | Pos: ${r.position.toFixed(1)}`);
    });
  } else {
    console.log('No search analytics rows returned (or property verified via sc-domain:). Response:', JSON.stringify(data));
    
    // Test sc-domain property
    console.log('\nTrying sc-domain:sujatanutrilive.com ...');
    const domainRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent('sc-domain:sujatanutrilive.com')}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        rowLimit: 50
      })
    });
    const domainData = await domainRes.json();
    console.log('sc-domain status:', domainRes.status);
    if (domainData.rows) {
      console.log(`Total queries found on sc-domain: ${domainData.rows.length}`);
      domainData.rows.slice(0, 15).forEach((r, i) => {
        console.log(`${i+1}. Query: "${r.keys[0]}" | Page: ${r.keys[1]} | Clicks: ${r.clicks} | Impressions: ${r.impressions} | CTR: ${(r.ctr * 100).toFixed(1)}% | Pos: ${r.position.toFixed(1)}`);
      });
    } else {
      console.log('sc-domain response:', JSON.stringify(domainData));
    }
  }
}

fetchGscPerformance().catch(console.error);

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const keyPath = path.join(process.cwd(), 'scripts', 'sujata-nutrilive-seo-7e48e83a62a6.json');
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
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

async function checkRealtime() {
  const propertyId = '513910296';
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);

  // Total active users (unsegmented)
  const totalRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics: [{ name: 'activeUsers' }]
    })
  });
  const totalData = await totalRes.json();
  console.log('Deduplicated Active Users Right Now:', totalData.rows?.[0]?.metricValues?.[0]?.value || 0);

  // By Device
  const devRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'deviceCategory' }, { name: 'operatingSystem' }]
    })
  });
  const devData = await devRes.json();
  console.log('\nBy Device & OS:');
  devData.rows?.forEach(r => console.log(`  ${r.dimensionValues[0].value} (${r.dimensionValues[1].value}): ${r.metricValues[0].value}`));

  // Minutes ago
  const minRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'minutesAgo' }]
    })
  });
  const minData = await minRes.json();
  console.log('\nBy Minutes Ago (Last 30 mins):');
  minData.rows?.sort((a,b) => parseInt(a.dimensionValues[0].value) - parseInt(b.dimensionValues[0].value)).forEach(r => {
    console.log(`  ${r.dimensionValues[0].value} mins ago: ${r.metricValues[0].value} users`);
  });
}

checkRealtime().catch(console.error);

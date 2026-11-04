import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const googleKey = JSON.parse(fs.readFileSync(path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json'), 'utf8'));

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
  const assertion = getGoogleJwt(scopes, googleKey);
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

async function checkAfterMagic() {
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

  // Query events breakdown by hour today
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '2026-10-29', endDate: '2026-10-29' }],
      dimensions: [{ name: 'hour' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      orderBys: [{ dimension: { dimensionName: 'hour' } }]
    })
  });
  const data = await res.json();

  console.log("=== HOURLY EVENTS BREAKDOWN TODAY (OCT 29) ===");
  const rows = data.rows || [];
  rows.forEach(r => {
    const hr = parseInt(r.dimensionValues[0].value, 10);
    const ev = r.dimensionValues[1].value;
    const cnt = r.metricValues[0].value;
    const u = r.metricValues[1].value;
    const istHr = (hr + 5) % 24;
    console.log(`${hr}:00 UTC (~${istHr}:30 IST) | ${ev.padEnd(20)} | Count: ${cnt.padStart(3)} | Users: ${u}`);
  });

  // Query Realtime events in the last 30 minutes
  const rtRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dimensions: [{ name: 'eventName' }, { name: 'city' }],
      metrics: [{ name: 'eventCount' }]
    })
  });
  const rtData = await rtRes.json();
  console.log("\n=== REALTIME EVENTS (LAST 30 MINUTES) ===");
  if (rtData.rows) {
    rtData.rows.forEach(r => {
      console.log(`Event: ${r.dimensionValues[0].value.padEnd(20)} | City: ${r.dimensionValues[1].value} | Count: ${r.metricValues[0].value}`);
    });
  } else {
    console.log("No events in last 30 mins.");
  }
}

checkAfterMagic();

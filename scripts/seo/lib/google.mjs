// scripts/seo/lib/google.mjs — service-account auth + small GSC / GA4 helpers for the SEO scripts.
// Key: scripts/sujata-nutrilive-seo-7e48e83a62a6.json (gitignored). Read-only scopes only.
import fs from 'node:fs';
import crypto from 'node:crypto';

const KEY_PATH = process.env.GOOGLE_SA_KEY || 'scripts/sujata-nutrilive-seo-7e48e83a62a6.json';
export const GSC_SITE = 'https://www.sujatanutrilive.com/';
export const GA4_PROPERTY = (process.env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

export async function googleToken(scopes) {
  const key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: key.client_email, scope: scopes.join(' '), aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now })}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signer.sign(key.private_key, 'base64url')}` }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Google token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

export function gscClient(token, site = GSC_SITE) {
  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  return {
    query: async (body) => (await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { method: 'POST', headers: H, body: JSON.stringify({ dataState: 'all', ...body }) })).json(),
    inspect: async (url) => (await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { method: 'POST', headers: H, body: JSON.stringify({ inspectionUrl: url, siteUrl: site }) })).json(),
    sitemaps: async () => (await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps`, { headers: H })).json(),
  };
}

export function ga4Client(token, property = GA4_PROPERTY) {
  return async (body) => (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
}

export const ga4Rows = (r) => (r.rows || []).map((x) => ({ d: x.dimensionValues.map((v) => v.value), m: x.metricValues.map((v) => Number(v.value)) }));

export function loadEnv(path = '.env') {
  const env = {};
  if (!fs.existsSync(path)) return env;
  for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^=#]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

export const isoDay = (d) => d.toISOString().slice(0, 10);
export const daysAgo = (n) => isoDay(new Date(Date.now() - n * 864e5));

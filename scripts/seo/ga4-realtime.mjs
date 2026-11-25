// scripts/seo/ga4-realtime.mjs — GA4 realtime event counts (last N minutes, max 30).
// Usage: node scripts/seo/ga4-realtime.mjs [minutes=30] [--wait-for eventName] (polls every 20 s up to 6 min)
import { googleToken, GA4_PROPERTY } from './lib/google.mjs';

const minutes = Math.min(30, Number(process.argv.find((a) => /^\d+$/.test(a)) || 30));
const waitIdx = process.argv.indexOf('--wait-for');
const waitFor = waitIdx > -1 ? process.argv[waitIdx + 1] : null;
const token = await googleToken(['https://www.googleapis.com/auth/analytics.readonly']);

async function counts() {
  const r = await (await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runRealtimeReport`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], minuteRanges: [{ startMinutesAgo: minutes - 1, endMinutesAgo: 0 }] }),
  })).json();
  if (r.error) throw new Error(r.error.message);
  return Object.fromEntries((r.rows || []).map((x) => [x.dimensionValues[0].value, Number(x.metricValues[0].value)]));
}

const deadline = Date.now() + 6 * 60 * 1000;
let c = await counts();
while (waitFor && !c[waitFor] && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 20000));
  c = await counts();
}
console.log(`GA4 realtime, last ${minutes} min:`, JSON.stringify(c));
if (waitFor) console.log(c[waitFor] ? `FOUND ${waitFor} x${c[waitFor]}` : `NOT FOUND: ${waitFor} after 6 min`);

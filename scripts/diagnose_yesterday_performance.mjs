// scripts/diagnose_yesterday_performance.mjs
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
  const keyPath = path.join(__dirname, 'sujata-nutrilive-seo-7e48e83a62a6.json');
  if (!fs.existsSync(keyPath)) return null;
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

async function runGA4Report(propertyId, token, body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function main() {
  console.log("=================================================================");
  console.log("🎯 DEEP PERFORMANCE & CRO AUDIT: YESTERDAY (2026-11-02)");
  console.log("=================================================================\n");

  // 1. SHOPIFY AUDIT: ORDERS & ABANDONED CHECKOUTS
  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const shopifyToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  console.log("--- 1. SHOPIFY ORDERS (2026-11-01 to 2026-11-03) ---");
  const ordersUrl = `https://${domain}/admin/api/2024-07/orders.json?status=any&created_at_min=2026-11-01T00:00:00Z&limit=50`;
  const ordersRes = await fetch(ordersUrl, {
    headers: { 'X-Shopify-Access-Token': shopifyToken, 'Content-Type': 'application/json' }
  });
  const ordersData = await ordersRes.json();
  const orders = ordersData.orders || [];
  console.log(`Total Orders found since Nov 1: ${orders.length}`);
  orders.forEach(o => {
    const ist = new Date(o.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`Order #${o.order_number} (${o.name}) | ${ist} | ₹${o.total_price} | Gateway: ${o.gateway} | Status: ${o.financial_status}/${o.fulfillment_status}`);
    console.log(`  Items: ${o.line_items.map(li => `${li.title} (${li.quantity}x)`).join(', ')}`);
    console.log(`  Customer: ${o.customer ? `${o.customer.first_name} ${o.customer.last_name || ''} (${o.customer.phone || o.email || 'N/A'})` : 'Guest'}`);
    console.log(`  Note/Attributes: ${JSON.stringify(o.note_attributes)} | Tags: ${o.tags}`);
    console.log('----------------------------------------------------');
  });

  console.log("\n--- 2. SHOPIFY ABANDONED CHECKOUTS (2026-11-01 to 2026-11-03) ---");
  const checkoutsUrl = `https://${domain}/admin/api/2024-07/checkouts.json?created_at_min=2026-11-01T00:00:00Z&limit=50`;
  const checkoutsRes = await fetch(checkoutsUrl, {
    headers: { 'X-Shopify-Access-Token': shopifyToken, 'Content-Type': 'application/json' }
  });
  const checkoutsData = await checkoutsRes.json();
  const checkouts = checkoutsData.checkouts || [];
  console.log(`Total Abandoned Checkouts found: ${checkouts.length}`);
  checkouts.forEach(c => {
    const ist = new Date(c.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`Checkout #${c.id} | ${ist} | Total: ₹${c.total_price} | Email/Phone: ${c.email || c.phone || 'Anonymous'}`);
    console.log(`  Items: ${c.line_items.map(li => `${li.title} (${li.quantity}x)`).join(', ')}`);
    console.log(`  Completed At: ${c.completed_at || 'Never completed'} | Abandoned URL: ${c.abandoned_checkout_url}`);
    console.log('----------------------------------------------------');
  });

  // 2. META ADS AUDIT
  console.log("\n--- 3. META ADS SPEND & FUNNEL METRICS (Oct 31, Nov 01, Nov 02) ---");
  const metaToken = env.META_ADS_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID || 'act_1045791637117525';

  const dates = ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03'];
  for (const date of dates) {
    const metaUrl = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${metaToken}&time_range={'since':'${date}','until':'${date}'}&level=campaign&fields=campaign_id,campaign_name,objective,spend,impressions,clicks,cpc,ctr,actions,cost_per_action_type&limit=50`;
    try {
      const res = await fetch(metaUrl);
      const data = await res.json();
      console.log(`\n>>> Date: ${date} <<<`);
      if (data.data && data.data.length > 0) {
        data.data.forEach(camp => {
          console.log(`Campaign: "${camp.campaign_name}" (Obj: ${camp.objective})`);
          console.log(`  Spend: ₹${camp.spend} | Impressions: ${camp.impressions} | Clicks: ${camp.clicks} | CTR: ${camp.ctr}% | CPC: ₹${camp.cpc}`);
          if (camp.actions) {
            console.log(`  Actions:`, camp.actions.map(a => `${a.action_type}: ${a.value}`).join(' | '));
          }
        });
      } else {
        console.log(`  No spend / insights returned for ${date}`);
      }
    } catch (e) {
      console.error(`Error fetching meta for ${date}:`, e.message);
    }
  }

  // 3. GA4 AUDIT
  console.log("\n--- 4. GA4 TRAFFIC & FUNNEL AUDIT ---");
  const token = await getGoogleToken(['https://www.googleapis.com/auth/analytics.readonly']);
  const propertyId = (env.GA4_PROPERTY_ID || '513910296').replace(/^properties\//, '');

  if (token) {
    // Daily comparison Oct 31, Nov 1, Nov 2
    console.log("\n>>> GA4 Daily High-Level Stats (Oct 31 - Nov 02) <<<");
    const gaDaily = await runGA4Report(propertyId, token, {
      dateRanges: [{ startDate: '2026-10-31', endDate: '2026-11-02' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'conversions' }
      ]
    });
    console.log(JSON.stringify(gaDaily.rows, null, 2));

    // Traffic Sources on Nov 02
    console.log("\n>>> GA4 Traffic Sources on Nov 02 (Yesterday) <<<");
    const gaSource = await runGA4Report(propertyId, token, {
      dateRanges: [{ startDate: '2026-11-02', endDate: '2026-11-02' }],
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ]
    });
    console.log(JSON.stringify(gaSource.rows, null, 2));

    // Landing Pages on Nov 02
    console.log("\n>>> GA4 Landing Pages on Nov 02 (Yesterday) <<<");
    const gaPages = await runGA4Report(propertyId, token, {
      dateRanges: [{ startDate: '2026-11-02', endDate: '2026-11-02' }],
      dimensions: [{ name: 'landingPage' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ]
    });
    console.log(JSON.stringify(gaPages.rows, null, 2));

    // Events on Nov 02
    console.log("\n>>> GA4 Key Events on Nov 02 (Yesterday) <<<");
    const gaEvents = await runGA4Report(propertyId, token, {
      dateRanges: [{ startDate: '2026-11-02', endDate: '2026-11-02' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [
        { name: 'eventCount' },
        { name: 'totalUsers' }
      ]
    });
    console.log(JSON.stringify(gaEvents.rows, null, 2));
  } else {
    console.log("Could not obtain Google Auth token.");
  }
}

main().catch(console.error);

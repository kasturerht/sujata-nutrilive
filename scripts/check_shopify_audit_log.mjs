import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function checkAllShopifyEvents() {
  const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const oData = await oRes.json();
  const token = oData.access_token;

  // Let's get the 50 most recent events across the entire shopify store
  const res = await fetch(`https://${domain}/admin/api/2024-04/events.json?limit=50`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log("=== RECENT SHOPIFY EVENTS ===");
  (data.events || []).forEach(e => {
    console.log(`[${e.created_at}] [${e.subject_type}] [${e.verb}] Author: ${e.author} | Msg: ${e.message?.slice(0, 100)}`);
  });
}

checkAllShopifyEvents();

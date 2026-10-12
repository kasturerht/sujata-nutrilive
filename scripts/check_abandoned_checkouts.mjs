import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      process.env[trimmed.substring(0, idx).trim()] = val;
    }
  }
}
loadEnv();

async function checkAbandonedCheckouts() {
  const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  console.log("Fetching abandoned checkouts...");
  const res = await fetch(`https://${domain}/admin/api/2024-04/checkouts.json?limit=250`, {
    headers: { 'X-Shopify-Access-Token': token }
  });

  if (!res.ok) {
    console.error("Checkouts API error:", res.status, await res.text());
    return;
  }

  const data = await res.json();
  const checkouts = data.checkouts || [];
  console.log(`Found ${checkouts.length} abandoned checkouts.`);

  const dayMap = {};
  checkouts.forEach(c => {
    const d = c.created_at.split('T')[0];
    if (!dayMap[d]) dayMap[d] = { count: 0, total_val: 0, items: [] };
    dayMap[d].count++;
    dayMap[d].total_val += parseFloat(c.total_price || 0);
    dayMap[d].items.push({
      email: c.email,
      phone: c.phone,
      referring_site: c.referring_site,
      landing_site: c.landing_site,
      total_price: c.total_price,
      created_at: c.created_at,
      abandoned_checkout_url: c.abandoned_checkout_url
    });
  });

  console.log("ABANDONED CHECKOUTS BY DAY:");
  console.log(JSON.stringify(dayMap, null, 2));

  fs.writeFileSync('scripts/abandoned_checkouts_dump.json', JSON.stringify(checkouts, null, 2), 'utf8');
}

checkAbandonedCheckouts().catch(console.error);

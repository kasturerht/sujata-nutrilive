import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.substring(0, idx).trim()] = val;
    }
  }
  return env;
}

const env = loadEnv();
const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function checkAndRegisterWebhook() {
  console.log('Checking existing webhooks for domain:', domain);
  const listUrl = `https://${domain}/admin/api/2024-01/webhooks.json`;
  const listRes = await fetch(listUrl, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    }
  });
  const listData = await listRes.json();
  console.log('Existing Webhooks:', JSON.stringify(listData, null, 2));

  const targetAddress = 'https://www.sujatanutrilive.com/api/webhooks/shopify-order';
  const existing = (listData.webhooks || []).find(w => w.address === targetAddress && w.topic === 'orders/create');

  if (existing) {
    console.log(`Webhook already registered with ID: ${existing.id}`);
    return;
  }

  console.log('\nRegistering orders/create webhook pointing to:', targetAddress);
  const createRes = await fetch(listUrl, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      webhook: {
        topic: 'orders/create',
        address: targetAddress,
        format: 'json'
      }
    })
  });

  const createData = await createRes.json();
  console.log('Registration Response:', JSON.stringify(createData, null, 2));
}

checkAndRegisterWebhook();

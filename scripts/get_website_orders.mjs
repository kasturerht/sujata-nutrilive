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

async function fetchShopifyOrders() {
  const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  console.log("=== QUERYING SHOPIFY ADMIN API FOR ALL WEBSITE ORDERS ===");
  console.log("Store Domain:", domain);
  console.log("Has Admin Token:", !!adminToken);

  if (!adminToken) {
    console.error("No SHOPIFY_ADMIN_ACCESS_TOKEN found in .env");
    return;
  }

  try {
    const url = `https://${domain}/admin/api/2024-01/orders.json?status=any&limit=250`;
    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json'
      }
    });

    console.log("Shopify API HTTP Status:", res.status);
    const data = await res.json();
    const orders = data.orders || [];
    console.log("Total Website Orders Found:", orders.length);

    if (orders.length === 0) {
      console.log("No orders found in Shopify.");
      return;
    }

    orders.forEach((o, idx) => {
      console.log(`\n--- Order #${o.order_number || o.name} ---`);
      console.log(`Date: ${o.created_at}`);
      console.log(`Total: ₹${o.total_price} (${o.financial_status}, Fulfillment: ${o.fulfillment_status || 'unfulfilled'})`);
      console.log(`Customer: ${o.customer?.first_name || ''} ${o.customer?.last_name || ''}, City: ${o.shipping_address?.city || o.billing_address?.city || 'N/A'}`);
      console.log(`Referring Site: ${o.referring_site || 'Direct / None'}`);
      console.log(`Landing Site: ${o.landing_site || 'N/A'}`);
      console.log(`Source Name: ${o.source_name || 'N/A'}`);
      
      const utms = o.note_attributes || [];
      if (utms.length > 0) {
        console.log(`Note Attributes / UTMs:`, JSON.stringify(utms));
      }
      
      const items = (o.line_items || []).map(li => `${li.title} (x${li.quantity})`).join(', ');
      console.log(`Items: ${items}`);
    });

  } catch (err) {
    console.error("Error fetching Shopify orders:", err);
  }
}

fetchShopifyOrders();

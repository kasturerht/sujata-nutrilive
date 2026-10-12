#!/usr/bin/env node
/**
 * 🛒 SUJATA NUTRILIVE: AMAZON SP-API OPERATIONS ENGINE
 * Real-time order monitoring, catalog & inventory synchronization for Amazon.in
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const CLIENT_ID = process.env.AMAZON_LWA_CLIENT_ID;
const CLIENT_SECRET = process.env.AMAZON_LWA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.AMAZON_REFRESH_TOKEN;
const MARKETPLACE_ID = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const SP_ENDPOINT = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('❌ Error: Amazon credentials missing in .env');
  process.exit(1);
}

// 1. Get LWA Access Token
async function getAccessToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to obtain access token (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.access_token;
}

// 2. Fetch Orders
export async function getRecentOrders(days = 7) {
  const token = await getAccessToken();
  const createdAfter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  
  const url = `${SP_ENDPOINT}/orders/v0/orders?MarketplaceIds=${MARKETPLACE_ID}&CreatedAfter=${encodeURIComponent(createdAfter)}`;
  const res = await fetch(url, {
    headers: {
      'x-amz-access-token': token,
      'User-Agent': 'SujataNutrilive/1.0 (Language=JavaScript)'
    }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch orders (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.payload?.Orders || [];
}

// CLI Runner
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'orders';

  console.log('========================================================');
  console.log('🛒 SUJATA NUTRILIVE: AMAZON SP-API OPERATIONS');
  console.log(`📍 Marketplace: Amazon India (${MARKETPLACE_ID})`);
  console.log('========================================================\n');

  try {
    if (command === 'orders') {
      const days = parseInt(args[1] || '7', 10);
      console.log(`📡 Fetching Amazon orders from the past ${days} days...\n`);
      const orders = await getRecentOrders(days);

      if (orders.length === 0) {
        console.log(`✅ No orders found in the last ${days} days.`);
        return;
      }

      console.log(`📦 Found ${orders.length} order(s):\n`);
      orders.forEach((o, i) => {
        const orderId = o.AmazonOrderId;
        const status = o.OrderStatus;
        const total = o.OrderTotal ? `₹${o.OrderTotal.Amount} ${o.OrderTotal.CurrencyCode}` : 'N/A';
        const date = new Date(o.PurchaseDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const city = o.ShippingAddress?.City || 'Unknown';
        const state = o.ShippingAddress?.StateOrRegion || '';
        const payMethod = o.PaymentMethodDetails?.[0] || o.PaymentMethod || 'Standard';
        const easyShip = o.EasyShipShipmentStatus || 'N/A';

        console.log(`[${i + 1}] Order ID: ${orderId}`);
        console.log(`    Date:     ${date}`);
        console.log(`    Status:   ${status} (EasyShip: ${easyShip})`);
        console.log(`    Amount:   ${total} (${payMethod})`);
        console.log(`    Location: ${city}, ${state}`);
        console.log('    ----------------------------------------------------');
      });
    } else {
      console.log(`Unknown command: ${command}. Use "orders".`);
    }
  } catch (err) {
    console.error('❌ Error executing command:', err.message);
  }
}

if (process.argv[1] && process.argv[1].endsWith('amazon-ops.mjs')) {
  main();
}

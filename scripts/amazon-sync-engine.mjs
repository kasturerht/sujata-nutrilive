#!/usr/bin/env node
/**
 * 🚀 SUJATA NUTRILIVE: AMAZON SP-API LISTINGS & SYNC ENGINE
 * Directly manages, patches, and synchronizes Amazon catalog, titles, bullets,
 * and backend search terms to capture Top-5 BSR category ranking.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Load Environment Variables
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.substring(0, idx).trim()] = val;
      }
    }
  }
}
loadEnv();

const CLIENT_ID = process.env.AMAZON_LWA_CLIENT_ID;
const CLIENT_SECRET = process.env.AMAZON_LWA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.AMAZON_REFRESH_TOKEN;
const SELLER_ID = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
const MARKETPLACE_ID = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const SP_ENDPOINT = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

// 2. Fetch LWA Access Token
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
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

// 3. Patch Listing
export async function patchListing(sku, productType, patches) {
  const token = await getAccessToken();
  const url = `${SP_ENDPOINT}/listings/2021-08-01/items/${SELLER_ID}/${encodeURIComponent(sku)}?marketplaceIds=${MARKETPLACE_ID}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json',
      'User-Agent': 'SujataNutrilive/1.0 (Language=JavaScript)'
    },
    body: JSON.stringify({
      productType,
      patches
    })
  });

  const data = await res.json();
  return { status: res.status, data };
}

// 4. Batch Deploy Optimizations
async function deployAllOptimizations() {
  console.log('===============================================================');
  console.log('🎯 SUJATA NUTRILIVE: AUTOMATED AMAZON LISTINGS OPTIMIZER');
  console.log(`📍 Seller ID: ${SELLER_ID} | Marketplace: Amazon.in (${MARKETPLACE_ID})`);
  console.log('===============================================================\n');

  const readyPath = path.join(rootDir, 'data', 'amazon-ready-listings.json');
  if (!fs.existsSync(readyPath)) {
    console.error('❌ Missing data/amazon-ready-listings.json');
    return;
  }

  const payload = JSON.parse(fs.readFileSync(readyPath, 'utf8'));
  const listings = payload.existing_listings_optimization || [];

  const productTypeMap = {
    'L5-UK79-BHXE': 'NUTRITIONAL_SUPPLEMENT',
    '8X-HQKV-14T7': 'HERBAL_SUPPLEMENT',
    'AB01': 'NUTRITIONAL_SUPPLEMENT'
  };

  for (const item of listings) {
    const pType = productTypeMap[item.sku] || 'NUTRITIONAL_SUPPLEMENT';
    console.log(`⚡ Optimizing SKU [${item.sku}] (ASIN: ${item.asin})...`);
    console.log(`   New Title: "${item.optimized_title.substring(0, 60)}..."`);

    const patches = [
      {
        op: 'replace',
        path: '/attributes/item_name',
        value: [
          {
            language_tag: 'en_IN',
            value: item.optimized_title,
            marketplace_id: MARKETPLACE_ID
          }
        ]
      },
      {
        op: 'replace',
        path: '/attributes/bullet_point',
        value: item.bullet_points.map(bp => ({
          language_tag: 'en_IN',
          value: bp,
          marketplace_id: MARKETPLACE_ID
        }))
      },
      {
        op: 'replace',
        path: '/attributes/generic_keyword',
        value: [
          {
            language_tag: 'en_IN',
            value: item.backend_search_terms,
            marketplace_id: MARKETPLACE_ID
          }
        ]
      }
    ];

    try {
      const res = await patchListing(item.sku, pType, patches);
      if (res.status === 200 && res.data.status === 'ACCEPTED') {
        console.log(`   ✅ SUCCESS: Changes Accepted! Submission ID: ${res.data.submissionId}`);
      } else {
        console.log(`   ⚠️ Response (${res.status}):`, JSON.stringify(res.data));
      }
    } catch (err) {
      console.error(`   ❌ Failed to patch ${item.sku}:`, err.message);
    }
    console.log('---------------------------------------------------------------');
    // Polite rate limit pause
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n🏁 Deployment Complete! Changes are processing on Amazon servers.');
}

if (process.argv[1] && process.argv[1].endsWith('amazon-sync-engine.mjs')) {
  deployAllOptimizations();
}

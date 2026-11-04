// scripts/deep-stock-audit.mjs
// Full Forensic Inventory & Stock Depletion Audit across Shopify, Amazon, and Google Merchant Feed
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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

const shopifyDomain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const shopifyToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

// 1. Audit Shopify Inventory
async function auditShopify() {
  console.log('📦 1. Querying Shopify Admin API for full inventory status...');
  if (!shopifyToken) {
    console.error('❌ Missing SHOPIFY_ADMIN_ACCESS_TOKEN in .env');
    return [];
  }

  const query = `
    query getInventoryAudit {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            tracksInventory
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  sku
                  barcode
                  price
                  inventoryQuantity
                  inventoryPolicy
                  inventoryItem {
                    id
                    tracked
                    inventoryLevels(first: 5) {
                      edges {
                        node {
                          quantities(names: ["available", "on_hand", "committed", "incoming"]) {
                            name
                            quantity
                          }
                          location {
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${shopifyDomain}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': shopifyToken
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  if (data.errors) {
    console.error('Shopify GraphQL Errors:', JSON.stringify(data.errors));
    return [];
  }

  const products = data.data?.products?.edges?.map(e => e.node) || [];
  console.log(`✅ Retrieved ${products.length} products from Shopify.`);
  return products;
}

// 2. Audit Amazon SP-API Inventory
async function getAmazonToken() {
  if (!process.env.AMAZON_REFRESH_TOKEN || !process.env.AMAZON_LWA_CLIENT_ID) {
    return null;
  }
  try {
    const res = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.AMAZON_REFRESH_TOKEN,
        client_id: process.env.AMAZON_LWA_CLIENT_ID,
        client_secret: process.env.AMAZON_LWA_CLIENT_SECRET
      })
    });
    const data = await res.json();
    return data.access_token;
  } catch (e) {
    console.error('Amazon Token Error:', e.message);
    return null;
  }
}

async function auditAmazon(skus) {
  console.log('\n📦 2. Querying Amazon SP-API for live catalog & stock status...');
  const token = await getAmazonToken();
  if (!token) {
    console.warn('⚠️ Amazon SP-API credentials not fully configured or token fetch failed.');
    return [];
  }

  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';
  const sellerId = process.env.AMAZON_SELLER_ID;
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV'; // Amazon India

  const amazonResults = [];

  for (const sku of skus) {
    try {
      const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers`;
      const res = await fetch(url, {
        headers: { 'x-amz-access-token': token }
      });

      if (res.ok) {
        const item = await res.json();
        const summary = item.summaries?.[0] || {};
        const fulfillmentAvail = item.attributes?.fulfillment_availability?.[0]?.quantity;
        const buyableStatus = summary.status;
        const asin = summary.asin;
        const itemName = summary.itemName;

        amazonResults.push({
          sku,
          asin,
          itemName,
          status: buyableStatus,
          quantity: fulfillmentAvail !== undefined ? fulfillmentAvail : 'N/A',
          issuesCount: item.issues?.length || 0,
          issues: item.issues?.map(i => i.message) || []
        });
      } else {
        const errText = await res.text();
        amazonResults.push({
          sku,
          status: `HTTP_${res.status}`,
          error: errText.slice(0, 150)
        });
      }
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      amazonResults.push({ sku, status: 'ERROR', error: e.message });
    }
  }

  return amazonResults;
}

// 3. Audit Google Merchant Feed
async function auditMerchantFeed() {
  console.log('\n📦 3. Querying Live Google Merchant XML Feed...');
  try {
    const res = await fetch('https://www.sujatanutrilive.com/google-merchant-feed.xml');
    const xml = await res.text();

    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const idMatch = block.match(/<g:id>([^<]+)<\/g:id>/);
      const titleMatch = block.match(/<title>([^<]+)<\/title>/);
      const availMatch = block.match(/<g:availability>([^<]+)<\/g:availability>/);
      const priceMatch = block.match(/<g:price>([^<]+)<\/g:price>/);
      const linkMatch = block.match(/<link>([^<]+)<\/link>/);

      items.push({
        id: idMatch ? idMatch[1] : 'unknown',
        title: titleMatch ? titleMatch[1] : 'unknown',
        availability: availMatch ? availMatch[1] : 'unknown',
        price: priceMatch ? priceMatch[1] : 'unknown',
        link: linkMatch ? linkMatch[1] : 'unknown'
      });
    }

    console.log(`✅ Loaded ${items.length} items from Google Merchant Feed.`);
    return items;
  } catch (e) {
    console.error('Merchant Feed Error:', e.message);
    return [];
  }
}

// Run Consolidated Audit
async function runConsolidatedStockAudit() {
  console.log('================================================================');
  console.log('🔍 SUJATA NUTRILIVE: MULTI-CHANNEL STOCK & INVENTORY FORENSIC AUDIT');
  console.log('================================================================\n');

  // 1. Shopify
  const shopifyProducts = await auditShopify();

  // Extract all SKUs
  const allSkus = [];
  const inventoryRows = [];

  for (const p of shopifyProducts) {
    for (const vEdge of p.variants?.edges || []) {
      const v = vEdge.node;
      if (v.sku) allSkus.push(v.sku);

      const qty = v.inventoryQuantity;
      const tracked = v.inventoryItem?.tracked;
      const policy = v.inventoryPolicy; // 'DENY' or 'CONTINUE'

      // Inventory status classification
      let stockStatus = 'HEALTHY';
      if (!tracked) {
        stockStatus = 'UNTRACKED (Unlimited)';
      } else if (qty <= 0) {
        stockStatus = policy === 'CONTINUE' ? 'BACKORDER (0 Stock, Overselling Allowed)' : 'OUT_OF_STOCK (0 Stock, Blocked)';
      } else if (qty <= 5) {
        stockStatus = 'CRITICAL_LOW (<= 5)';
      } else if (qty <= 15) {
        stockStatus = 'LOW_STOCK (<= 15)';
      }

      inventoryRows.push({
        productId: p.id,
        handle: p.handle,
        productTitle: p.title,
        variantTitle: v.title,
        sku: v.sku,
        barcode: v.barcode,
        price: v.price,
        quantity: qty,
        tracked,
        policy,
        status: stockStatus
      });
    }
  }

  // 2. Amazon (Known SKUs)
  const knownAmazonSkus = [
    '8X-HQKV-14T7',
    'L5-UK79-BHXE',
    'AB01',
    'SJT-SP-CAP-60',
    'SJT-SP-CAP-180',
    'SJT-SP-SOAP-100G',
    'SJT-SP-TAB-60',
    'SJT-SP-TAB-120',
    'SJT-SB-CAP-60',
    'SJT-BR-CRM-50G',
    'SJT-SP-OIL-50ML',
    'SJT-SP-SHP-100ML'
  ];
  const amazonResults = await auditAmazon(knownAmazonSkus);

  // 3. Google Merchant Feed
  const merchantItems = await auditMerchantFeed();

  // Save full diagnostic dump
  const fullReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalVariants: inventoryRows.length,
      outOfStockCount: inventoryRows.filter(r => r.status.includes('OUT_OF_STOCK')).length,
      backorderCount: inventoryRows.filter(r => r.status.includes('BACKORDER')).length,
      criticalLowCount: inventoryRows.filter(r => r.status.includes('CRITICAL_LOW')).length,
      lowStockCount: inventoryRows.filter(r => r.status.includes('LOW_STOCK')).length,
      healthyCount: inventoryRows.filter(r => r.status === 'HEALTHY').length,
      untrackedCount: inventoryRows.filter(r => r.status.includes('UNTRACKED')).length
    },
    shopifyInventory: inventoryRows,
    amazonInventory: amazonResults,
    googleMerchantInventory: merchantItems
  };

  fs.writeFileSync('scripts/stock_audit_full_report.json', JSON.stringify(fullReport, null, 2));

  console.log('\n================================================================');
  console.log('📊 MULTI-CHANNEL STOCK AUDIT SUMMARY:');
  console.log(`   Total Shopify Variants Tracked: ${inventoryRows.length}`);
  console.log(`   🔴 Strictly OUT OF STOCK (Blocked): ${fullReport.summary.outOfStockCount}`);
  console.log(`   ⚠️ Backorder / Overselling (Stock <= 0): ${fullReport.summary.backorderCount}`);
  console.log(`   🚨 Critical Low (<= 5 left): ${fullReport.summary.criticalLowCount}`);
  console.log(`   🟡 Low Stock (6 - 15 left): ${fullReport.summary.lowStockCount}`);
  console.log(`   🟢 Healthy Stock (> 15 left): ${fullReport.summary.healthyCount}`);
  console.log(`   ♾️ Untracked (Sell without inventory limit): ${fullReport.summary.untrackedCount}`);
  console.log('================================================================\n');

  console.log('--- 🔴 OUT OF STOCK & BACKORDER VARIANTS ---');
  inventoryRows.filter(r => r.quantity <= 0 && r.tracked).forEach(r => {
    console.log(`  • [${r.sku || 'NO-SKU'}] ${r.productTitle} (${r.variantTitle}): Qty = ${r.quantity} | Policy: ${r.policy} (${r.status})`);
  });

  console.log('\n--- 🚨 CRITICAL LOW STOCK (1 to 5 units left) ---');
  inventoryRows.filter(r => r.quantity > 0 && r.quantity <= 5 && r.tracked).forEach(r => {
    console.log(`  • [${r.sku || 'NO-SKU'}] ${r.productTitle} (${r.variantTitle}): Qty = ${r.quantity} units left!`);
  });

  console.log('\n--- 🟡 LOW STOCK (6 to 15 units left) ---');
  inventoryRows.filter(r => r.quantity > 5 && r.quantity <= 15 && r.tracked).forEach(r => {
    console.log(`  • [${r.sku || 'NO-SKU'}] ${r.productTitle} (${r.variantTitle}): Qty = ${r.quantity} units left.`);
  });

  console.log('\n--- 📦 AMAZON SP-API STATUS ---');
  amazonResults.forEach(a => {
    console.log(`  • SKU: ${a.sku} | ASIN: ${a.asin || 'N/A'} | Status: ${a.status} | Qty: ${a.quantity} | Issues: ${a.issuesCount}`);
  });
}

runConsolidatedStockAudit();

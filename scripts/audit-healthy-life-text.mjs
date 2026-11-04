// scripts/audit-healthy-life-text.mjs
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

async function getAmazonToken() {
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
}

async function auditAmazon() {
  const token = await getAmazonToken();
  const sellerId = process.env.AMAZON_SELLER_ID;
  const marketId = process.env.AMAZON_MARKETPLACE_ID;
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT;

  const skus = ['SJT-CMBO-HL-1M', 'SJT-CMBO-HL-2M', 'SJT-CMBO-HL-3M'];
  console.log('========================================================================');
  console.log('🔍 FULL AMAZON LISTING DETAILS FOR HEALTHY LIFE COMBOS');
  console.log('========================================================================');

  const amazonDetails = {};

  for (const sku of skus) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    const data = await res.json();
    amazonDetails[sku] = data;
    console.log(`\n------------------------------------------------------------`);
    console.log(`SKU: ${sku} | ASIN: ${data.summaries?.[0]?.asin}`);
    console.log(`Title: ${data.attributes?.item_name?.[0]?.value}`);
    console.log(`Form: ${data.attributes?.item_form?.[0]?.value}`);
    console.log(`Bullet Points:`);
    data.attributes?.bullet_point?.forEach((b, idx) => console.log(`  [${idx+1}] ${b.value}`));
    console.log(`Description:`);
    console.log(`  ${data.attributes?.product_description?.[0]?.value}`);
    console.log(`Generic Keyword:`);
    console.log(`  ${data.attributes?.generic_keyword?.map(k => k.value).join(', ')}`);
    await new Promise(r => setTimeout(r, 400));
  }

  fs.writeFileSync('scripts/amazon_hl_audit_full.json', JSON.stringify(amazonDetails, null, 2));
}

async function auditShopify() {
  const shopDomain = 'tvczdq-nu.myshopify.com';
  const token = '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';
  const query = `{
    products(first: 20) {
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          tags
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                price
              }
            }
          }
        }
      }
    }
  }`;
  const res = await fetch(`https://${shopDomain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('\n========================================================================');
  console.log('🔍 ALL SHOPIFY PRODUCTS & COMBOS');
  console.log('========================================================================');
  data.data?.products?.edges?.forEach(e => {
    const p = e.node;
    console.log(`Product: "${p.title}" | Handle: ${p.handle} | ID: ${p.id}`);
    p.variants.edges.forEach(v => {
      console.log(`   SKU: ${v.node.sku} | Variant: "${v.node.title}" | Price: ₹${v.node.price}`);
    });
  });

  fs.writeFileSync('scripts/shopify_all_products.json', JSON.stringify(data.data?.products?.edges, null, 2));
}

async function main() {
  await auditAmazon();
  await auditShopify();
}

main().catch(console.error);

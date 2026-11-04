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

const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = process.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '7e0a0176aede63ce4c6b199e18684018';
const publicJudgemeToken = process.env.PUBLIC_JUDGEME_TOKEN || '1S3X_MR--dEFToT4LdW_H_S1B-s';

async function listAllProducts() {
  const q = `
    query {
      products(first: 50) {
        edges {
          node {
            id
            handle
            title
          }
        }
      }
    }
  `;
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query: q })
  });
  const data = await res.json();
  const products = data.data.products.edges.map(e => e.node);
  console.log('Total Products in Store:', products.length);
  
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const numId = p.id.replace('gid://shopify/Product/', '').split('?')[0];
    
    // Check Judge.me badge & widget for this product
    const badgeUrl = `https://judge.me/api/v1/widgets/preview_badge?api_token=${publicJudgemeToken}&shop_domain=${domain}&handle=${p.handle}`;
    const bRes = await fetch(badgeUrl);
    const bData = await bRes.json();
    const hasReviews = bData.badge && !bData.badge.includes('data-number-of-reviews=\'0\'');
    
    console.log(`${i+1}. [${p.handle}] (ID: ${numId})`);
    console.log(`   Title: ${p.title}`);
    console.log(`   Judge.me Badge Status: ${bRes.status}, Has Reviews: ${hasReviews}`);
  }
}
listAllProducts().catch(console.error);

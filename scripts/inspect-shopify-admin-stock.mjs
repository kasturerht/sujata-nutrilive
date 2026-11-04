// scripts/inspect-shopify-admin-stock.mjs
import fs from 'fs';

async function testShopifyAdmin() {
  const domain = 'tvczdq-nu.myshopify.com';
  const token = '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';

  const query = `
    query {
      capsules: productByHandle(handle: "sujata-spirulina-capsules") {
        id
        title
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              inventoryQuantity
              inventoryPolicy
              inventoryItem {
                id
                tracked
              }
            }
          }
        }
      }
      combo: productByHandle(handle: "sujata-spirulina-sea-buckthorn-combo-pack") {
        id
        title
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              inventoryQuantity
              inventoryPolicy
              inventoryItem {
                id
                tracked
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

testShopifyAdmin();

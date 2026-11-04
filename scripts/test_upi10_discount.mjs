// scripts/test_upi10_discount.mjs
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  });
}

const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const storefrontToken = env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '7e0a0176aede63ce4c6b199e18684018';

async function testDiscount() {
  const variantId = "gid://shopify/ProductVariant/52759081779332"; // 1-Month Pack (₹1,050)

  const cartRes = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken
    },
    body: JSON.stringify({
      query: `
        mutation {
          cartCreate(input: {
            lines: [{ quantity: 1, merchandiseId: "${variantId}" }],
            discountCodes: ["UPI10"]
          }) {
            cart {
              id
              checkoutUrl
              discountCodes {
                code
                applicable
              }
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
                subtotalAmount {
                  amount
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `
    })
  });

  const cartData = await cartRes.json();
  console.log('Cart Create with UPI10:');
  console.log(JSON.stringify(cartData, null, 2));
}

testDiscount().catch(console.error);

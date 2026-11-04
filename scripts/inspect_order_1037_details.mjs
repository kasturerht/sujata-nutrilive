import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const shopifyDomain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const clientId = env.SHOPIFY_CLIENT_ID;
const clientSecret = env.SHOPIFY_CLIENT_SECRET;

async function getShopifyToken() {
  const oRes = await fetch(`https://${shopifyDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })
  });
  const oData = await oRes.json();
  return oData.access_token;
}

async function run() {
  const token = await getShopifyToken();
  const query = `
    query {
      orders(first: 5, reverse: true) {
        edges {
          node {
            name
            createdAt
            totalPriceSet { shopMoney { amount } }
            shippingAddress {
              name
              phone
              address1
              city
              province
              zip
            }
            customer {
              firstName
              lastName
              email
              phone
            }
            note
            customAttributes { key value }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${shopifyDomain}/admin/api/2024-07/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  console.log(JSON.stringify(data.data.orders.edges, null, 2));
}

run().catch(console.error);

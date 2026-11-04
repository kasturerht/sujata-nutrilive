import fs from 'fs';
import path from 'path';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const m = l.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const domain = env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const token = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function checkGraphQLOrders() {
  const query = `
    query getRecentOrders {
      orders(first: 10, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            displayFinancialStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            channelInformation {
              channelDefinition {
                channelName
              }
            }
            customer {
              displayName
              phone
              email
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/admin/api/2024-07/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  if (json.errors) {
    console.error('GraphQL Errors:', json.errors);
    return;
  }

  const orders = (json.data?.orders?.edges || []).map(e => {
    const o = e.node;
    return {
      Order: o.name,
      'Created (UTC)': o.createdAt,
      'Created (IST)': new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      Total: '₹' + o.totalPriceSet?.shopMoney?.amount,
      Status: o.displayFinancialStatus,
      Customer: o.customer?.displayName || 'Guest',
      Items: o.lineItems?.edges?.map(li => li.node.title + ' (x' + li.node.quantity + ')').join(', ')
    };
  });

  console.log('\n=== REAL SHOPIFY ORDERS (LATEST) ===');
  console.table(orders);
}

checkGraphQLOrders().catch(console.error);

// scripts/check-cap180-level.mjs
const token = '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';
const query = `
  query {
    inventoryItem(id: "gid://shopify/InventoryItem/69588062371972") {
      id
      tracked
      inventoryLevels(first: 5) {
        edges {
          node {
            id
            location {
              id
            }
            quantities(names: ["available", "on_hand"]) {
              name
              quantity
            }
          }
        }
      }
    }
  }
`;

async function run() {
  const res = await fetch('https://tvczdq-nu.myshopify.com/admin/api/2024-04/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('Cap 180 Level Data:', JSON.stringify(data, null, 2));
}

run();

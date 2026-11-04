// scripts/check-variant-details.mjs
const token = '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';
const query = `
  query {
    productVariant(id: "gid://shopify/ProductVariant/67604020002948") {
      id
      title
      availableForSale
      inventoryQuantity
      inventoryPolicy
      inventoryItem {
        id
        tracked
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
  console.log('Variant data:', JSON.stringify(data, null, 2));
}

run();

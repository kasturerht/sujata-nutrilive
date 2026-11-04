// scripts/test-storefront-inventory.mjs
const domain = 'tvczdq-nu.myshopify.com';
const token = '7e0a0176aede63ce4c6b199e18684018';

const query = `
  query getStockStorefront {
    products(first: 50) {
      edges {
        node {
          id
          title
          handle
          availableForSale
          totalInventory
          variants(first: 20) {
            edges {
              node {
                id
                title
                sku
                barcode
                availableForSale
                quantityAvailable
                currentlyNotInStock
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchInventory() {
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  if (data.errors) {
    console.error('Errors:', JSON.stringify(data.errors));
    return;
  }

  const products = data.data?.products?.edges || [];
  console.log(`Retrieved ${products.length} products from Shopify Storefront API:\n`);
  
  for (const p of products) {
    const node = p.node;
    console.log(`[${node.handle}] ${node.title} | AvailableForSale: ${node.availableForSale} | TotalInv: ${node.totalInventory}`);
    for (const v of node.variants.edges) {
      console.log(`  - Variant: "${v.node.title}" | SKU: ${v.node.sku || 'N/A'} | Barcode: ${v.node.barcode || 'N/A'} | Avail: ${v.node.availableForSale} | QtyAvail: ${v.node.quantityAvailable} | NotInStock: ${v.node.currentlyNotInStock} | Price: ₹${v.node.price.amount}`);
    }
  }
}

fetchInventory();

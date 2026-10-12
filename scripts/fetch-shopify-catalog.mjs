import fs from 'fs';

async function fetchShopify() {
  const query = `{
    products(first: 50) {
      edges {
        node {
          id
          title
          handle
          description
          productType
          tags
          variants(first: 20) {
            edges {
              node {
                id
                title
                sku
                priceV2 { amount currencyCode }
                compareAtPriceV2 { amount currencyCode }
                availableForSale
                selectedOptions { name value }
              }
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }`;

  const res = await fetch('https://tvczdq-nu.myshopify.com/api/2023-07/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': '7e0a0176aede63ce4c6b199e18684018'
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  const products = json.data.products.edges.map(e => e.node);
  
  console.log(`Fetched ${products.length} products from Shopify!`);
  fs.writeFileSync('data/shopify-full-catalog.json', JSON.stringify(products, null, 2));
  
  products.forEach((p, i) => {
    console.log(`\n[${i + 1}] ${p.title} (Type: ${p.productType})`);
    console.log(`    Variants: ${p.variants.edges.map(v => `${v.node.title} (SKU: ${v.node.sku || 'N/A'}, ₹${v.node.priceV2.amount})`).join(' | ')}`);
    console.log(`    Images: ${p.images.edges.length} images available`);
  });
}

fetchShopify().catch(console.error);

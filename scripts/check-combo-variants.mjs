const token = '7e0a0176aede63ce4c6b199e18684018';
const domain = 'tvczdq-nu.myshopify.com';

async function checkComboVariants() {
  const query = `
    query {
      product(handle: "sujata-spirulina-sea-buckthorn-combo-pack") {
        id
        title
        handle
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              price { amount }
              compareAtPrice { amount }
              availableForSale
            }
          }
        }
      }
    }
  `;

  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

checkComboVariants().catch(console.error);

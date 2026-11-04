// scripts/get-hl-combo-shopify.mjs
const domain = 'tvczdq-nu.myshopify.com';
const token = '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';

async function getProduct() {
  const query = `
    query {
      product(id: "gid://shopify/Product/10473731162244") {
        id
        title
        handle
        descriptionHtml
        tags
        seo {
          title
          description
        }
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              price
              selectedOptions {
                name
                value
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
  console.log(JSON.stringify(data, null, 2));
}

getProduct();

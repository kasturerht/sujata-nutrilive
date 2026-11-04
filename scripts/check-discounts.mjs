import fs from 'fs';

const domain = 'tvczdq-nu.myshopify.com';
const token = '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';

async function checkDiscounts() {
  const query = `
  query {
    priceRules(first: 20) {
      edges {
        node {
          id
          title
          targetType
          targetSelection
          allocationMethod
          valueType
          value
          customerSelection
        }
      }
    }
    automaticDiscountNodes(first: 20) {
      edges {
        node {
          id
          automaticDiscount {
            ... on DiscountAutomaticBasic {
              title
              status
              summary
            }
            ... on DiscountAutomaticBxgy {
              title
              status
              summary
            }
            ... on DiscountAutomaticFreeShipping {
              title
              status
              summary
            }
          }
        }
      }
    }
  }
  `;

  const res = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('Price Rules / Discounts in Shopify:');
  console.log(JSON.stringify(data, null, 2));
}

checkDiscounts().catch(console.error);

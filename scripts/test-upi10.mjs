const token = '7e0a0176aede63ce4c6b199e18684018';
const domain = 'tvczdq-nu.myshopify.com';

async function testDiscount() {
  const query = `
    mutation {
      cartCreate(input: {
        lines: [{ quantity: 1, merchandiseId: "gid://shopify/ProductVariant/67604020002948" }],
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
            subtotalAmount { amount }
            totalAmount { amount }
          }
        }
        userErrors {
          field
          message
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
  console.log('Cart with UPI10 Discount:');
  console.log(JSON.stringify(data, null, 2));
}

testDiscount().catch(console.error);

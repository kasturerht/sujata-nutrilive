async function generateTestCheckout() {
  const domain = 'tvczdq-nu.myshopify.com';
  const token = '7e0a0176aede63ce4c6b199e18684018';
  
  const query = `mutation {
    cartCreate(input: {
      lines: [
        {
          quantity: 1,
          merchandiseId: "gid://shopify/ProductVariant/52738357854340"
        }
      ]
    }) {
      cart {
        id
        checkoutUrl
      }
    }
  }`;

  const res = await fetch('https://' + domain + '/api/2024-07/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  let checkoutUrl = data.data?.cartCreate?.cart?.checkoutUrl;
  if (checkoutUrl) {
    checkoutUrl += '&discount=UPI10';
    console.log('TEST_CHECKOUT_URL:', checkoutUrl);
  }
}
generateTestCheckout();
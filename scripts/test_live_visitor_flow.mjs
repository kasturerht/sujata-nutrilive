// scripts/test_live_visitor_flow.mjs
async function testFlow() {
  const pdpUrl = 'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack';
  console.log("1. Testing PDP:", pdpUrl);
  const pRes = await fetch(pdpUrl);
  console.log("PDP HTTP:", pRes.status);

  // 2. Test Storefront cartCreate
  const domain = 'tvczdq-nu.myshopify.com';
  const token = '7e0a0176aede63ce4c6b199e18684018';
  const variantId = 'gid://shopify/ProductVariant/52738357854340';

  const cartRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token
    },
    body: JSON.stringify({
      query: `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
          }
        }
      `,
      variables: {
        input: {
          lines: [{ quantity: 1, merchandiseId: variantId }]
        }
      }
    })
  });

  const cartData = await cartRes.json();
  let checkoutUrl = cartData?.data?.cartCreate?.cart?.checkoutUrl;
  console.log("2. Raw Checkout URL:", checkoutUrl);

  // Auto-apply UPI10
  if (checkoutUrl) {
    checkoutUrl += '&discount=UPI10';
    console.log("3. Checkout URL with UPI10:", checkoutUrl);

    const cRes = await fetch(checkoutUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' }
    });
    console.log("4. Checkout HTTP Status:", cRes.status);
  }
}

testFlow();

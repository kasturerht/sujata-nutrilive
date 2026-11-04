// scripts/test-checkout-flow.mjs
async function testCart() {
  const domain = 'tvczdq-nu.myshopify.com';
  const token = '7e0a0176aede63ce4c6b199e18684018';
  
  // 1. Get first product variant
  const getProdQuery = `{
    products(first: 3) {
      edges {
        node {
          id
          title
          variants(first: 1) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount }
              }
            }
          }
        }
      }
    }
  }`;

  const pRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query: getProdQuery })
  });
  const pData = await pRes.json();
  const firstVariant = pData.data?.products?.edges?.[0]?.node?.variants?.edges?.[0]?.node;
  console.log('Selected Test Variant:', firstVariant);

  if (!firstVariant) {
    console.error('No variant found!');
    return;
  }

  // 2. Create Cart
  const cartQuery = `mutation createCart($variantId: ID!) {
    cartCreate(input: {
      lines: [{ quantity: 1, merchandiseId: $variantId }]
    }) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount { amount currencyCode }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const cartRes = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({
      query: cartQuery,
      variables: { variantId: firstVariant.id }
    })
  });
  const cartData = await cartRes.json();
  console.log('Cart Creation Result:', JSON.stringify(cartData, null, 2));

  const checkoutUrl = cartData.data?.cartCreate?.cart?.checkoutUrl;
  if (checkoutUrl) {
    console.log('\nTesting Checkout URL:', checkoutUrl);
    const chkRes = await fetch(checkoutUrl, { method: 'GET', redirect: 'manual' });
    console.log('Checkout URL Status Code:', chkRes.status);
    console.log('Checkout Location Header:', chkRes.headers.get('location'));
  }

  // Check payment gateways via admin API if token present
  const adminToken = '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';
  try {
    const gwRes = await fetch(`https://${domain}/admin/api/2024-01/payment_gateways.json`, {
      headers: { 'X-Shopify-Access-Token': adminToken, 'Content-Type': 'application/json' }
    });
    const gwData = await gwRes.json();
    console.log('\nEnabled Payment Gateways on Shopify:');
    (gwData.payment_gateways || []).forEach(gw => {
      console.log(`• Gateway: ${gw.name} (Type: ${gw.type || 'N/A'}, Enabled: ${gw.enabled})`);
    });
  } catch (e) {
    console.error('Payment Gateway fetch error:', e.message);
  }
}

testCart();

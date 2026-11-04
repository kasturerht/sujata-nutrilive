async function testFullFlow() {
  const rzpKey = 'rzp_live_TV8wwiNECUNJs0';

  // 1. Create Magic Checkout session on Razorpay
  const cartToken = 'cart_' + Date.now();
  const payload = {
    cart: {
      token: cartToken,
      item_count: 1,
      items: [
        {
          id: 52738357854340,
          quantity: 1,
          variant_id: 52738357854340
        }
      ]
    }
  };

  const checkRes = await fetch('https://api.razorpay.com/v1/magic/checkout/shopify?key_id=' + rzpKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  console.log('Step 1 Magic Checkout Status:', checkRes.status);
  const checkData = await checkRes.json();
  console.log('Step 1 Data:', checkData);

  if (!checkData.shopify_checkout_id) return;

  // 2. Create Magic Order using shopify_checkout_id
  const orderRes = await fetch('https://api.razorpay.com/v1/magic/order/shopify?key_id=' + rzpKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Origin': 'https://api.razorpay.com'
    },
    body: JSON.stringify({
      shopify_checkout_id: checkData.shopify_checkout_id
    })
  });
  console.log('Step 2 Order Status:', orderRes.status);
  const orderData = await orderRes.json();
  console.log('Step 2 Order Data:', orderData);
}
testFullFlow();
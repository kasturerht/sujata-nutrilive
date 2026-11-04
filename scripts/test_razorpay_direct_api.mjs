// scripts/test_razorpay_direct_api.mjs
async function testDirect() {
  const RAZORPAY_KEY_ID = "rzp_live_TV8wwiNECUNJs0";
  console.log("Calling Razorpay Magic Checkout endpoint...");

  const formattedItems = [
    {
      id: 52738357854340,
      variant_id: 52738357854340,
      quantity: 1
    }
  ];

  try {
    const magicCheckoutRes = await fetch(`https://api.razorpay.com/v1/magic/checkout/shopify?key_id=${RAZORPAY_KEY_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        cart: {
          token: `cart_${Date.now()}`,
          note: "test",
          attributes: {},
          item_count: 1,
          items: formattedItems
        },
        coupon_code: "UPI10"
      })
    });

    console.log("Status:", magicCheckoutRes.status);
    const text = await magicCheckoutRes.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testDirect();

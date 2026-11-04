// scripts/test_razorpay_step2.mjs
async function testStep2() {
  const RAZORPAY_KEY_ID = "rzp_live_TV8wwiNECUNJs0";
  const shopifyCheckoutId = "gid://shopify/Cart/hWNIb2s9xzCcz96chWHx5Jv2?key=be4c8ea09eda57b7bec32f3f43f6cd62";

  console.log("Calling Step 2 (Order creation)...");
  try {
    const orderRes = await fetch(`https://api.razorpay.com/v1/magic/order/shopify?key_id=${RAZORPAY_KEY_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Origin': 'https://api.razorpay.com'
      },
      body: JSON.stringify({
        shopify_checkout_id: shopifyCheckoutId
      })
    });

    console.log("Status:", orderRes.status);
    const text = await orderRes.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testStep2();

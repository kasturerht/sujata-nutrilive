// scripts/test_magic_checkout_live.mjs
async function testMagic() {
  console.log("Testing live /api/magic-checkout endpoint...");
  const payload = {
    items: [
      {
        id: "gid://shopify/ProductVariant/52738357854340",
        quantity: 1,
        title: "Sujata Spirulina + Sea Buckthorn Healthy Life Combo Pack",
        price: 945
      }
    ],
    coupon_code: "UPI10",
    payment_mode: "upi",
    attributes: {
      utm_source: "meta_test"
    }
  };

  const res = await fetch("https://www.sujatanutrilive.com/api/magic-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  const data = await res.text();
  console.log("Response:", data);
}

testMagic();

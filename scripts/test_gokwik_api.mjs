// scripts/test_gokwik_api.mjs
async function testGoKwik() {
  const merchantId = '191nlev4b53c';
  const appId = 'app_id_fb445b71-a6f4-4f60-a1f7-7102a5044a30';
  const appSecret = 'app_secret_7fb6bd67-0716-4063-a576-74e85aa53831';

  console.log("Testing GoKwik endpoints...");

  // 1. Check merchant configuration endpoint
  try {
    const res = await fetch(`https://api.gokwik.co/v1/merchant/config?merchantId=${merchantId}`, {
      headers: {
        'app_id': appId,
        'app_secret': appSecret
      }
    });
    console.log("Merchant config status:", res.status);
    const data = await res.json();
    console.log("Merchant config data:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Merchant config error:", e.message);
  }

  // 2. Check checkout script
  try {
    const sRes = await fetch(`https://checkout.gokwik.co/v1/gokwik.js`);
    console.log("checkout.gokwik.co script status:", sRes.status);
  } catch (e) {
    console.log("checkout script error:", e.message);
  }

  // 3. Check sandbox/prod pdp script
  try {
    const pRes = await fetch(`https://pdp.gokwik.co/pdp.js`);
    console.log("pdp script status:", pRes.status);
  } catch (e) {
    console.log("pdp script error:", e.message);
  }
}

testGoKwik();

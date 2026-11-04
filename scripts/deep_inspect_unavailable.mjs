import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function getAmazonToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.AMAZON_REFRESH_TOKEN,
      client_id: env.AMAZON_LWA_CLIENT_ID,
      client_secret: env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const data = await res.json();
  return data.access_token;
}

async function deepInspect(sku, asin) {
  const token = await getAmazonToken();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const lUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers,fulfillmentAvailability`;
  const lRes = await fetch(lUrl, { headers: { 'x-amz-access-token': token } });
  const lData = await lRes.json();

  console.log(`\n=================== SKU: ${sku} (ASIN: ${asin}) ===================`);
  console.log('SP-API Status:', lData.summaries?.[0]?.status);
  console.log('SP-API Offers:', JSON.stringify(lData.offers, null, 2));
  console.log('SP-API Issues:', JSON.stringify(lData.issues, null, 2));
  console.log('Purchasable Offer Attribute:', JSON.stringify(lData.attributes?.purchasable_offer, null, 2));
  console.log('Merchant Shipping Group:', JSON.stringify(lData.attributes?.merchant_shipping_group, null, 2));
  console.log('Fulfillment Availability:', JSON.stringify(lData.attributes?.fulfillment_availability, null, 2));

  // Check web page
  try {
    const liveRes = await fetch(`https://www.amazon.in/dp/${asin}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const html = await liveRes.text();
    // Look for buybox or availability div
    const availMatch = html.match(/<div id="availability"[^>]*>([\s\S]*?)<\/div>/);
    if (availMatch) {
      console.log('Live Availability Div:', availMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    } else {
      console.log('No #availability div found');
    }
    const merchantMatch = html.match(/<div id="merchant-info"[^>]*>([\s\S]*?)<\/div>/);
    if (merchantMatch) {
      console.log('Live Merchant Info Div:', merchantMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    }
  } catch (err) {
    console.error('Web page error:', err.message);
  }
}

async function run() {
  await deepInspect('SJT-B12-CAP-90', 'B0HMJDWMSB');
  await deepInspect('SJT-SP-CAP-180', 'B0HMJRHQZL');
}

run();

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

async function compareAttributes() {
  const token = await getAmazonToken();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  async function getSku(sku) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=attributes,offers,fulfillmentAvailability,summaries`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    return await res.json();
  }

  const liveSku = await getSku('8X-HQKV-14T7'); // Live & Buyable
  const unavailSku = await getSku('SJT-B12-CAP-90'); // Currently Unavailable

  console.log('--- 8X-HQKV-14T7 (LIVE) ---');
  console.log('Status:', liveSku.summaries?.[0]?.status);
  console.log('Merchant shipping group:', liveSku.attributes?.merchant_shipping_group);
  console.log('Fulfillment channel:', liveSku.attributes?.fulfillment_availability);
  console.log('Purchasable offer:', JSON.stringify(liveSku.attributes?.purchasable_offer, null, 2));

  console.log('--- SJT-B12-CAP-90 (UNAVAILABLE) ---');
  console.log('Status:', unavailSku.summaries?.[0]?.status);
  console.log('Merchant shipping group:', unavailSku.attributes?.merchant_shipping_group);
  console.log('Fulfillment channel:', unavailSku.attributes?.fulfillment_availability);
  console.log('Purchasable offer:', JSON.stringify(unavailSku.attributes?.purchasable_offer, null, 2));
}

compareAttributes();

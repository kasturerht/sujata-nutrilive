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

async function hideSpirulina60TabOnAmazon() {
  const token = await getAmazonToken();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const sku = '8X-HQKV-14T7'; // Spirulina 60 Tablets
  const productType = 'HERBAL_SUPPLEMENT';

  console.log(`🔒 Hiding Spirulina 60 Tablets on Amazon...`);
  console.log(`   Seller ID: ${sellerId}`);
  console.log(`   Marketplace: ${marketId}`);
  console.log(`   SKU: ${sku}`);

  const patchUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}`;

  const patchPayload = {
    productType,
    patches: [
      {
        op: 'replace',
        path: '/attributes/fulfillment_availability',
        value: [
          {
            fulfillment_channel_code: 'DEFAULT',
            quantity: 0
          }
        ]
      }
    ]
  };

  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json',
      'User-Agent': 'SujataNutrilive/1.0'
    },
    body: JSON.stringify(patchPayload)
  });

  const data = await res.json();
  console.log(`Amazon SP-API Response Status:`, res.status);
  console.log(`Response Body:`, JSON.stringify(data, null, 2));

  return data;
}

hideSpirulina60TabOnAmazon();

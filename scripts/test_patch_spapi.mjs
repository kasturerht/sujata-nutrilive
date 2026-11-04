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

async function testPatch() {
  const token = await getAmazonToken();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const sku = 'SJT-SP-CAP-180';
  const patchUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}`;

  // Let's send a patch to refresh fulfillment_availability and purchasable_offer
  const body = {
    productType: "HERBAL_SUPPLEMENT",
    patches: [
      {
        op: "replace",
        path: "/attributes/fulfillment_availability",
        value: [
          {
            fulfillment_channel_code: "DEFAULT",
            quantity: 50
          }
        ]
      },
      {
        op: "replace",
        path: "/attributes/purchasable_offer",
        value: [
          {
            currency: "INR",
            audience: "ALL",
            our_price: [
              {
                schedule: [
                  {
                    value_with_tax: 1099
                  }
                ]
              }
            ],
            maximum_retail_price: [
              {
                schedule: [
                  {
                    value_with_tax: 1550
                  }
                ]
              }
            ],
            minimum_seller_allowed_price: [
              {
                schedule: [
                  {
                    value_with_tax: 899
                  }
                ]
              }
            ],
            maximum_seller_allowed_price: [
              {
                schedule: [
                  {
                    value_with_tax: 1550
                  }
                ]
              }
            ],
            marketplace_id: marketId
          }
        ]
      }
    ]
  };

  console.log(`Sending PATCH to ${patchUrl}...`);
  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  console.log('HTTP Status:', res.status);
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

testPatch();

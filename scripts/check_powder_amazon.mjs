import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function run() {
  const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.AMAZON_REFRESH_TOKEN,
      client_id: env.AMAZON_LWA_CLIENT_ID,
      client_secret: env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const { access_token } = await tokenRes.json();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const sku = 'L5-UK79-BHXE';
  const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=summaries,attributes,issues,offers`;

  const res = await fetch(url, {
    headers: {
      'x-amz-access-token': access_token,
      'Content-Type': 'application/json'
    }
  });

  const data = await res.json();
  console.log('Status code:', res.status);
  console.log('Summaries:', JSON.stringify(data.summaries, null, 2));
  console.log('Fulfillment Availability:', JSON.stringify(data.attributes?.fulfillment_availability, null, 2));
}

run();

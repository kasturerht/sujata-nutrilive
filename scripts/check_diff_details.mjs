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

async function checkDiff() {
  const token = await getAmazonToken();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  async function getSku(sku) {
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketId}&includedData=attributes,offers,fulfillmentAvailability,summaries`;
    const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
    return await res.json();
  }

  const live = await getSku('SJT-SB-CAP-60');
  const unavail = await getSku('SJT-B12-CAP-90');

  console.log('--- WEIGHT & DIMENSIONS ---');
  console.log('SB weight:', live.attributes?.item_package_weight);
  console.log('SB dimensions:', live.attributes?.item_package_dimensions);
  console.log('B12 weight:', unavail.attributes?.item_package_weight);
  console.log('B12 dimensions:', unavail.attributes?.item_package_dimensions);

  console.log('--- PRODUCT TYPE & CATEGORY ---');
  console.log('SB productType:', live.summaries?.[0]?.productType);
  console.log('B12 productType:', unavail.summaries?.[0]?.productType);
}

checkDiff();

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

async function dumpAllAttributes() {
  const token = await getAmazonToken();
  const sellerId = env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/SJT-B12-CAP-90?marketplaceIds=${marketId}&includedData=attributes,issues,offers,fulfillmentAvailability,summaries`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
  const data = await res.json();

  fs.writeFileSync('reports/b12_full_spapi.json', JSON.stringify(data, null, 2));
  console.log('Saved reports/b12_full_spapi.json');
}

dumpAllAttributes();

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

async function checkPricing() {
  const token = await getAmazonToken();
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const asins = ['B0HMJHWLV3', 'B0HMJDWMSB', 'B0DP2FWN4J', 'B0HMJRHQZL'];
  const url = `${endpoint}/products/pricing/v0/price?MarketplaceId=${marketId}&ItemType=Asin&Asins=${asins.join(',')}`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
  const data = await res.json();

  console.log('--- Pricing API Response ---');
  for (const item of (data.payload || [])) {
    console.log(`\nASIN: ${item.ASIN} (Status: ${item.status})`);
    const p = item.Product;
    if (p) {
      console.log('Identifiers:', p.Identifiers?.MarketplaceASIN);
      console.log('Offers count:', p.Offers?.length || 0);
      if (p.Offers && p.Offers.length > 0) {
        console.log('First offer:', JSON.stringify(p.Offers[0], null, 2));
      }
    }
  }
}

checkPricing();

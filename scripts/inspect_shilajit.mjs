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

async function testPricingAndLive() {
  const token = await getAmazonToken();
  const marketId = env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  console.log("--- Checking Competitive Pricing for B0HMJHG237 (Shilajit) ---");
  const pUrl = `${endpoint}/products/pricing/v0/competitivePrice?MarketplaceId=${marketId}&ItemType=Asin&Asins=B0HMJHG237`;
  const pRes = await fetch(pUrl, { headers: { 'x-amz-access-token': token } });
  const pData = await pRes.json();
  console.log('Competitive Price Data:', JSON.stringify(pData, null, 2));

  console.log("--- Checking Live Web Page for B0HMJHG237 ---");
  try {
    const liveRes = await fetch('https://www.amazon.in/dp/B0HMJHG237', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('HTTP Status on Amazon.in:', liveRes.status);
    const html = await liveRes.text();
    const hasCurrentlyUnavailable = html.includes('Currently unavailable') || html.includes('Currently, unavailable');
    const hasAddToCart = html.includes('add-to-cart-button') || html.includes('submit.add-to-cart');
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log('Page Title:', titleMatch ? titleMatch[1] : 'No title');
    console.log('Currently Unavailable:', hasCurrentlyUnavailable);
    console.log('Add to Cart button present:', hasAddToCart);
  } catch (err) {
    console.error('Error fetching web page:', err.message);
  }
}

testPricingAndLive();

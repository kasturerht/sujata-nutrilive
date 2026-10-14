// scripts/search-amazon-spiru.mjs
async function searchAmazon() {
  const url = 'https://www.amazon.in/s?k=spiru+swastha';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-IN,en;q=0.9'
    }
  });
  const html = await res.text();
  const asinMatches = html.matchAll(/data-asin="([A-Z0-9]{10})"/g);
  const asins = [...new Set([...asinMatches].map(m => m[1]).filter(Boolean))];
  console.log('Found ASINs on amazon:', asins.slice(0, 10));

  for (const asin of asins.slice(0, 5)) {
    const itemUrl = `https://www.amazon.in/dp/${asin}`;
    const iRes = await fetch(itemUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9'
      }
    });
    const iHtml = await iRes.text();
    const title = iHtml.match(/<title>([^<]+)<\/title>/i);
    console.log(`ASIN ${asin}:`, title ? title[1].trim() : 'N/A');
  }
}
searchAmazon().catch(console.error);

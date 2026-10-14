// scripts/check-public-page-details.mjs
async function checkPublicPage(asin) {
  const url = `https://www.amazon.in/dp/${asin}`;
  console.log(`Checking ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9'
      }
    });
    console.log('HTTP Status:', res.status);
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    console.log('Title:', titleMatch ? titleMatch[1].trim() : 'N/A');
    const brandMatch = html.match(/id="bylineInfo"[^>]*>([^<]+)<\/a>/i);
    console.log('Brand:', brandMatch ? brandMatch[1].trim() : 'N/A');
    const sellerMatch = html.match(/id="sellerProfileTriggerId"[^>]*>([^<]+)<\/a>/i);
    console.log('Sold by:', sellerMatch ? sellerMatch[1].trim() : 'N/A');
    const availMatch = html.match(/id="availability"[^>]*>([\s\S]*?)<\/div>/i);
    console.log('Availability:', availMatch ? availMatch[1].replace(/<[^>]+>/g, '').trim() : 'N/A');
  } catch (e) {
    console.error('Error:', e);
  }
}

async function main() {
  console.log('--- SUJATA ASIN: B0GMQYS6M4 ---');
  await checkPublicPage('B0GMQYS6M4');
  console.log('\n--- SPIRU SWASTHA ASIN: B0DYVKLH52 ---');
  await checkPublicPage('B0DYVKLH52');
}

main();

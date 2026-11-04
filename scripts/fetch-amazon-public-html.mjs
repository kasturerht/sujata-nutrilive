// scripts/fetch-amazon-public-html.mjs
import https from 'https';

const asins = ['B0HMJNHVNH', 'B0HMJRLX2C', 'B0HMJD6LYN'];

async function fetchPage(asin) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.amazon.in',
      path: `/dp/${asin}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n============================================================`);
        console.log(`ASIN: ${asin} | HTTP Status: ${res.status}`);
        
        // Extract Title
        const titleMatch = data.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
        if (titleMatch) {
          console.log('Product Title:', titleMatch[1].trim());
        }

        // Check for variation buttons / twister
        const twisterMatch = data.match(/id="variation_size_name"[\s\S]*?<\/div>/i);
        console.log('Size Twister found?:', !!twisterMatch);

        // Check for images
        const has2MImage = data.includes('71HhUAYeLuL');
        const has3MImage = data.includes('712P1M9QV8L');
        const has1MImage = data.includes('61PrCP-+YgL');
        console.log(`Contains 1M Image (61PrCP-+YgL): ${has1MImage}`);
        console.log(`Contains 2M Image (71HhUAYeLuL): ${has2MImage}`);
        console.log(`Contains 3M Image (712P1M9QV8L): ${has3MImage}`);

        // Check for tablet mentions
        const tabletMatches = (data.match(/tablet/gi) || []).length;
        console.log(`Number of "tablet" mentions on page: ${tabletMatches}`);
        
        resolve();
      });
    }).on('error', err => {
      console.error(err);
      resolve();
    });
  });
}

async function run() {
  for (const asin of asins) {
    await fetchPage(asin);
  }
}

run();

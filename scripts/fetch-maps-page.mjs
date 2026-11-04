// scripts/fetch-maps-page.mjs
import fs from 'fs';

async function run() {
  const res = await fetch('https://www.google.com/maps/search/?api=1&query=Sujata+Nutrilive+Agrotech+Nashik', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const html = await res.text();
  console.log('HTML length:', html.length);
  fs.writeFileSync('scripts/maps_search.html', html, 'utf8');

  // Check for ChIJ Place IDs or 0x hex IDs
  const placeMatches = html.match(/ChIJ[a-zA-Z0-9_-]{20,40}/g);
  console.log('ChIJ Matches:', placeMatches ? [...new Set(placeMatches)] : 'None');

  const hexMatches = html.match(/0x[0-9a-fA-F]+:0x[0-9a-fA-F]+/g);
  console.log('Hex Matches:', hexMatches ? [...new Set(hexMatches)] : 'None');
}

run();

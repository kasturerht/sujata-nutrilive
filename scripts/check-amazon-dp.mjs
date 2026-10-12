async function checkPublicPage() {
  const url = 'https://www.amazon.in/dp/B0DNSXGGTN';
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
    console.log('Page Title:', titleMatch ? titleMatch[1].trim() : 'N/A');
    const priceMatch = html.match(/class="a-price-whole">([^<]+)<\/span>/i);
    console.log('Price found:', priceMatch ? priceMatch[1] : 'N/A');
    const availability = html.match(/id="availability"[^>]*>([\s\S]*?)<\/div>/i);
    if (availability) {
      console.log('Availability Text:', availability[1].replace(/<[^>]+>/g, '').trim());
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkPublicPage();

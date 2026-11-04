async function testWithPincode() {
  const asin = 'B0HMJDWMSB';
  // Pincode 400001 (Mumbai) or 422001 (Nashik)
  // In Amazon, location-mapping or sp-cdn sets destination
  const res = await fetch(`https://www.amazon.in/dp/${asin}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Cookie': 'ubid-acbin=259-1234567-1234567; session-id=259-7654321-7654321; lc-acbin=en_IN; i18n-prefs=INR'
    }
  });
  const html = await res.text();
  console.log('Currently unavailable?', html.includes('Currently unavailable'));
  console.log('Add to cart?', html.includes('add-to-cart-button'));
  console.log('See All Buying Options?', html.includes('See All Buying Options'));
  
  // Also check if there is an offer-listing link:
  const gpOlp = html.match(/\/gp\/offer-listing\/[A-Z0-9]+/);
  console.log('OLP link:', gpOlp ? gpOlp[0] : 'None');
}
testWithPincode();

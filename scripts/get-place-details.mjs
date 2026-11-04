// scripts/get-place-details.mjs
async function run() {
  const url = 'https://www.google.com/maps/search/?api=1&query=Sujata+Nutrilive+Agrotech+Nashik';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  console.log('Status:', res.status);
  console.log('Final URL:', res.url);
}
run();

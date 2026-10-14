// scripts/test-redirect.mjs
async function testRedirect() {
  const url = 'https://www.amazon.in/dp/B0GMQYS6M4';
  const res = await fetch(url, {
    redirect: 'manual',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-IN,en;q=0.9'
    }
  });
  console.log('Status:', res.status);
  console.log('Location:', res.headers.get('location'));

  const followRes = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-IN,en;q=0.9'
    }
  });
  console.log('Final URL:', followRes.url);
  const text = await followRes.text();
  const title = text.match(/<title>([^<]+)<\/title>/i);
  console.log('Final Page Title:', title ? title[1] : 'N/A');
}

testRedirect();

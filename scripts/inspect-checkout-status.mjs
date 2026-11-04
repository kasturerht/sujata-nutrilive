// scripts/inspect-checkout-status.mjs
async function check() {
  const url = 'https://tvczdq-nu.myshopify.com/cart/c/hWNIU5z3edU3JK7ojXxwNwzE?discount=UPI10';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  console.log('HTTP Status:', res.status);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  const text = await res.text();
  console.log('Body length:', text.length);
  if (text.includes('Cloudflare') || text.includes('Attention Required') || text.includes('Challenge')) {
    console.log('Blocked by Cloudflare/Bot Protection');
  } else if (text.includes('password')) {
    console.log('Storefront is password protected');
  } else {
    console.log('Body sample:', text.slice(0, 500));
  }
}
check();

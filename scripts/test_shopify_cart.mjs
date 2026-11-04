async function testShopifyCart() {
  const res = await fetch('https://tvczdq-nu.myshopify.com/cart');
  console.log('Cart page status:', res.status);
  const html = await res.text();
  console.log('Contains Magic / Razorpay:', html.toLowerCase().includes('magic') || html.toLowerCase().includes('razorpay'));
  const scripts = html.match(/https:\/\/[^"]*razorpay[^"]*/g);
  console.log('Scripts:', scripts);
}
testShopifyCart();
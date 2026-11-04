async function getUrls() {
  const res = await fetch('https://magic-plugins.razorpay.com/shopify/magic-shopify.js');
  const text = await res.text();
  const urls = text.match(/https?:\/\/[^\s"'`<>]+/g) || [];
  console.log('URLs in magic-shopify.js:', [...new Set(urls)].slice(0, 30));
}
getUrls();
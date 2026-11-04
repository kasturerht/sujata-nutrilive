async function searchMagic() {
  const res = await fetch('https://magic-plugins.razorpay.com/shopify/magic-shopify.js');
  const text = await res.text();
  
  // Search for how it hooks into Shopify buttons or cart
  const terms = ['checkout', 'button', 'redirect', 'shopify_checkout_id', 'magic_checkout'];
  for (const term of terms) {
    const regex = new RegExp(`[a-zA-Z0-9_.-]{0,20}${term}[a-zA-Z0-9_.-]{0,20}`, 'gi');
    const matches = text.match(regex) || [];
    console.log(`Term ${term}:`, matches.slice(0, 10));
  }
}
searchMagic();
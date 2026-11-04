async function checkRatingInput() {
  const jsRes = await fetch('https://cdn.shopify.com/extensions/01a14416-995f-7951-a981-854ef92a0fd4/judgeme-786/assets/shopify_v2.js');
  const js = await jsRes.text();
  
  // Find where form HTML is constructed
  const idx = js.indexOf('.jdgm-form__rating');
  console.log(js.slice(idx - 600, idx + 100));
}
checkRatingInput();

async function checkLiveJsonLd() {
  const res = await fetch("https://www.sujatanutrilive.com/product/sujata-spirulina-capsules");
  const html = await res.text();
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (match) {
    const json = JSON.parse(match[1]);
    const items = json["@graph"] || [];
    console.log("Total graph items:", items.length);
    const prod = items.find(i => i["@type"] === "Product");
    if (prod) {
      console.log("Product Name:", prod.name);
      console.log("Product ASIN:", prod.asin);
      console.log("Product sameAs:", prod.sameAs);
      console.log("Offers count:", prod.offers?.length);
      console.log("Offer 0 Return Policy:", prod.offers?.[0]?.hasMerchantReturnPolicy);
      console.log("Offer 1 (Amazon):", prod.offers?.[1]);
    } else {
      console.log("Product not found in graph!");
      console.log("Graph item types:", items.map(i => i["@type"]));
    }
  } else {
    console.log("No ld+json script found");
  }
}

checkLiveJsonLd();

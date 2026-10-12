import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('data/shopify-full-catalog.json', 'utf8'));

console.log("=========================================================================================");
console.log("EMPIRICAL AUDIT: DYNAMIC STRIKETHROUGH PRICE BEHAVIOR ACROSS ALL STORE PRODUCTS");
console.log("=========================================================================================\n");

const auditResults = [];

raw.forEach(p => {
  const edge = p.variants?.edges?.[0]?.node;
  if (!edge) return;
  const basePrice = parseFloat(edge.priceV2?.amount || edge.price?.amount || edge.price || 0);
  const compareAtPrice = parseFloat(edge.compareAtPriceV2?.amount || edge.compareAtPrice?.amount || edge.compareAtPrice || 0);

  // Exact math from renderProductPricing() in src/pages/product/[handle].astro:
  // 1. In UPI mode:
  const upiPrice = Math.round(basePrice * 0.9);
  const upiStrikethrough = basePrice; // comparePriceDisplay.innerText = `₹${formatINRClient(productState.basePrice)}`
  
  // 2. In COD mode:
  const codPrice = basePrice;
  const currentCompare = compareAtPrice > basePrice ? compareAtPrice : Math.round(basePrice * 1.3);
  const codStrikethrough = currentCompare; // comparePriceDisplay.innerText = `₹${formatINRClient(currentCompare)}`

  const strikethroughJump = codStrikethrough - upiStrikethrough;
  const strikethroughJumpPct = Math.round((strikethroughJump / upiStrikethrough) * 100);

  auditResults.push({
    title: p.title,
    handle: p.handle,
    shopify_base_price: `₹${basePrice}`,
    shopify_compare_at: compareAtPrice > 0 ? `₹${compareAtPrice}` : 'None (0)',
    UPI_Mode: {
      selling_price: `₹${upiPrice}`,
      strikethrough_price: `₹${upiStrikethrough}`
    },
    COD_Mode: {
      selling_price: `₹${codPrice}`,
      strikethrough_price: `₹${codStrikethrough}`
    },
    strikethrough_jump: `+₹${strikethroughJump} (+${strikethroughJumpPct}%)`,
    has_anomaly: strikethroughJump !== 0
  });
});

console.table(auditResults.map(r => ({
  Product: r.title.substring(0, 32) + '...',
  'Base Price': r.shopify_base_price,
  'UPI Selling': r.UPI_Mode.selling_price,
  'UPI Strikethrough': r.UPI_Mode.strikethrough_price,
  'COD Selling': r.COD_Mode.selling_price,
  'COD Strikethrough': r.COD_Mode.strikethrough_price,
  'Jump on COD click': r.strikethrough_jump
})));

fs.writeFileSync('scripts/audit_pricing_results.json', JSON.stringify(auditResults, null, 2), 'utf8');

import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const ALL_AMAZON_SKUS = [
  { sku: 'L5-UK79-BHXE', name: 'Spirulina Powder 100g', asin: 'B0DP2FWN4J' },
  { sku: '8X-HQKV-14T7', name: 'Spirulina Tablets 60', asin: 'B0DNSXGGTN' },
  { sku: 'SJT-SP-TAB-120', name: 'Spirulina Tablets 120', asin: 'B0HMJD7SJ9' },
  { sku: 'AB01', name: 'Spirulina Capsules 60', asin: 'B0GMQYS6M4' },
  { sku: 'SJT-SP-CAP-120', name: 'Spirulina Capsules 120', asin: 'B0HMJFFVCW' },
  { sku: 'SJT-SP-CAP-180', name: 'Spirulina Capsules 180', asin: 'B0HMJRHQZL' },
  { sku: 'SJT-SB-CAP-60', name: 'Sea Buckthorn Capsules 60', asin: 'B0HMJHWLV3' },
  { sku: 'SJT-B12-CAP-90', name: 'Vitamin B12 Capsules 90', asin: 'B0HMJDWMSB' },
  { sku: 'SJT-SHIL-CAP-60', name: 'Shilajit Capsules 60', asin: 'B0HMJHG237' },
  { sku: 'SJT-MOR-PWD-100G', name: 'Moringa Powder 100g', asin: 'B0HMJMYRS5' },
  { sku: 'SJT-CMBO-HL-1M', name: 'Healthy Life Combo 1 Month', asin: 'B0HMJNHVNH' },
  { sku: 'SJT-CMBO-HL-2M', name: 'Healthy Life Combo 2 Month', asin: 'B0HMJRLX2C' },
  { sku: 'SJT-CMBO-HL-3M', name: 'Healthy Life Combo 3 Month', asin: 'B0HMJD6LYN' },
  { sku: 'SJT-COMBO-SP90-SB60', name: 'Spirulina 90 + SeaBuckthorn 60', asin: 'B0HMJNJ2LP' },
  { sku: 'SJT-COMBO-SP120-SB60', name: 'Spirulina 120 + SeaBuckthorn 60', asin: 'B0HMKBCF92' },
  { sku: 'SJT-SP-SOAP-100G', name: 'Spirulina Soap 100g', asin: 'B0HMJF366D' },
  { sku: 'SJT-SP-SOAP-5PK', name: 'Spirulina Soap 5-Pack', asin: 'B0HMKR4W22' },
  { sku: 'SJT-SP-SOAP-10PK', name: 'Spirulina Soap 10-Pack', asin: 'B0HMKD5F7N' },
  { sku: 'SJT-SP-KC-50G', name: 'Spirulina Cream 50g', asin: 'B0HMJNTHKF' },
  { sku: 'SJT-SP-OIL-50ML', name: 'Spirulina Hair Oil 50ml', asin: 'B0HMJM64G3' },
  { sku: 'SJT-SP-SHP-100ML', name: 'Spirulina Shampoo 100ml', asin: 'B0HMJL173K' }
];

async function checkAllLivePages() {
  console.log("Checking live web pages on amazon.in for all 21 ASINs...\n");
  const results = [];

  for (const item of ALL_AMAZON_SKUS) {
    const url = `https://www.amazon.in/dp/${item.asin}`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8'
        }
      });
      const html = await res.text();
      const status = res.status;
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].trim() : 'No Title';
      const is404 = status === 404 || title.includes('Page Not Found');
      const hasAddToCart = html.includes('id="add-to-cart-button"') || html.includes('name="submit.add-to-cart"');
      const isUnavailable = html.includes('Currently unavailable') || html.includes('Currently, unavailable');
      const hasBuyNow = html.includes('id="buy-now-button"') || html.includes('name="submit.buy-now"');

      let customerState = 'UNKNOWN';
      if (is404) customerState = '❌ 404 DOG PAGE / NOT FOUND';
      else if (hasAddToCart || hasBuyNow) customerState = '✅ 100% BUYABLE (Add to Cart / Buy Now Live)';
      else if (isUnavailable) customerState = '⚠️ CURRENTLY UNAVAILABLE';
      else customerState = `⚠️ Page Loaded (HTTP ${status}) but no cart button found`;

      console.log(`[${item.sku}] ${item.asin} -> ${customerState}`);
      results.push({
        sku: item.sku,
        name: item.name,
        asin: item.asin,
        httpStatus: status,
        title: title.slice(0, 60),
        customerState,
        isBuyable: hasAddToCart || hasBuyNow
      });
    } catch (e) {
      console.log(`[${item.sku}] ${item.asin} -> ERROR: ${e.message}`);
    }
  }

  fs.writeFileSync('reports/amazon_live_customer_check.json', JSON.stringify(results, null, 2));
  console.log("\nResults written to reports/amazon_live_customer_check.json");
}

checkAllLivePages();

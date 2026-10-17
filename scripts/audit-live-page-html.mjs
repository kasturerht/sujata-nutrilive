// scripts/audit-live-page-html.mjs
import fs from 'fs';

async function run() {
  console.log('Fetching https://www.sujatanutrilive.com/product/sujata-spirulina-tablets ...');
  const res = await fetch('https://www.sujatanutrilive.com/product/sujata-spirulina-tablets');
  console.log('HTTP Status:', res.status);
  const html = await res.text();
  console.log('Total HTML Bytes:', html.length);

  // Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  console.log('Page Title:', titleMatch ? titleMatch[1] : 'NONE');

  // Meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  console.log('Meta Description:', metaDescMatch ? metaDescMatch[1] : 'NONE');

  // Canonical
  const canMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  console.log('Canonical URL:', canMatch ? canMatch[1] : 'NONE');

  // Robots
  const robMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  console.log('Robots Meta:', robMatch ? robMatch[1] : 'NONE');

  // H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  console.log('H1:', h1Match ? h1Match[1].replace(/\s+/g, ' ').trim() : 'NONE');

  // Open Graph
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  console.log('OG Title:', ogTitle ? ogTitle[1] : 'NONE');
  console.log('OG Image:', ogImage ? ogImage[1] : 'NONE');

  // Schema LD+JSON scripts
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null) {
    count++;
    console.log(`\n--- SCHEMA #${count} ---`);
    try {
      const data = JSON.parse(match[1]);
      if (data['@graph']) {
        console.log('Type: @graph containing:');
        data['@graph'].forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item['@type']} (${item['@id'] || item.name || 'unnamed'})`);
          if (item['@type'] === 'Product') {
            console.log('     Product name:', item.name);
            console.log('     Product sku:', item.sku);
            console.log('     Product gtin13:', item.gtin13 || 'none');
            console.log('     Offers Type:', item.offers ? item.offers['@type'] : 'none');
            if (item.offers && item.offers['@type'] === 'AggregateOffer') {
              console.log('     AggregateOffer: Low Price ₹' + item.offers.lowPrice + ' | High Price ₹' + item.offers.highPrice + ' (' + item.offers.offerCount + ' offers)');
              (item.offers.offers || []).forEach((o, oidx) => {
                console.log(`       Offer #${oidx + 1}: ${o.name} -> ₹${o.price} ${o.priceCurrency} | SKU: ${o.sku} | GTIN13: ${o.gtin13 || 'none'} | InStock: ${o.availability.includes('InStock')} | URL: ${o.url}`);
              });
            } else if (Array.isArray(item.offers)) {
              item.offers.forEach(o => console.log('       Offer:', o.priceCurrency, o.price, o['@type'], o.seller?.name || '', 'GTIN13:', o.gtin13 || 'none'));
            }
            console.log('     Product aggregateRating:', item.aggregateRating?.ratingValue, `(${item.aggregateRating?.reviewCount} reviews)`);
            if (Array.isArray(item.review)) {
              console.log(`     Product individual reviews (${item.review.length}):`);
              item.review.forEach((r, ridx) => {
                console.log(`       Review #${ridx + 1}: ${r.author?.name} (${r.reviewRating?.ratingValue}★) - "${r.name}"`);
              });
            }
            if (item.nutrition) {
              console.log('     Product Nutrition: Serving:', item.nutrition.servingSize, '| Protein:', item.nutrition.proteinContent, '| Iron:', item.nutrition.ironContent, '| Calories:', item.nutrition.calories);
            }
            if (Array.isArray(item.additionalProperty)) {
              console.log(`     Product Additional Properties (${item.additionalProperty.length}):`);
              item.additionalProperty.forEach(p => console.log(`       - ${p.name}: ${p.value}`));
            }
          }
          if (item['@type'] === 'FAQPage') {
            console.log('     FAQ count:', item.mainEntity?.length);
            item.mainEntity?.forEach(q => console.log('       Q:', q.name));
          }
        });
      } else {
        console.log('Type:', data['@type']);
      }
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  }
}

run().catch(console.error);

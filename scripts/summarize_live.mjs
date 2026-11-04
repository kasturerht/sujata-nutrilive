import fs from 'fs';

const liveReport = JSON.parse(fs.readFileSync('reports/amazon_live_customer_check.json', 'utf8'));
const fullReport = JSON.parse(fs.readFileSync('reports/amazon_catalog_deep_audit.json', 'utf8'));

console.log('=== SUMMARY OF LIVE AUDIT ===');
console.log('Total Products:', liveReport.length);

const liveItems = liveReport.filter(i => i.isBuyable);
const unavailItems = liveReport.filter(i => i.customerState.includes('CURRENTLY UNAVAILABLE'));
const dogItems = liveReport.filter(i => i.customerState.includes('404'));

console.log(`\n✅ 100% BUYABLE & ACTIVE FOR CUSTOMERS: ${liveItems.length} products`);
liveItems.forEach(i => console.log(`   - [${i.sku}] ${i.name} (ASIN: ${i.asin})`));

console.log(`\n⚠️ CURRENTLY UNAVAILABLE FOR CUSTOMERS: ${unavailItems.length} products`);
unavailItems.forEach(i => console.log(`   - [${i.sku}] ${i.name} (ASIN: ${i.asin})`));

console.log(`\n❌ NOT FOUND / 404 DOG PAGE: ${dogItems.length} products`);
dogItems.forEach(i => console.log(`   - [${i.sku}] ${i.name} (ASIN: ${i.asin})`));

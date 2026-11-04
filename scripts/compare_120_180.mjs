import fs from 'fs';

async function compareHtml() {
  const res120 = await fetch('https://www.amazon.in/dp/B0HMJFFVCW', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html120 = await res120.text();

  const res180 = await fetch('https://www.amazon.in/dp/B0HMJRHQZL', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html180 = await res180.text();

  console.log('120 Caps - Price in HTML:', html120.match(/₹[\d,.]+/g)?.slice(0, 5));
  console.log('120 Caps - Has submit.add-to-cart:', html120.includes('submit.add-to-cart'));
  console.log('120 Caps - Has Currently unavailable:', html120.includes('Currently unavailable'));

  console.log('\n180 Caps - Price in HTML:', html180.match(/₹[\d,.]+/g)?.slice(0, 5));
  console.log('180 Caps - Has submit.add-to-cart:', html180.includes('submit.add-to-cart'));
  console.log('180 Caps - Has Currently unavailable:', html180.includes('Currently unavailable'));

  // Let's check merchant info for 120
  const m120 = html120.match(/Sold by.*?<\/a>/);
  console.log('120 Caps - Sold by:', m120 ? m120[0].replace(/<[^>]+>/g, '') : 'None');

  // Let's check merchant info for 180
  const m180 = html180.match(/Sold by.*?<\/a>/);
  console.log('180 Caps - Sold by:', m180 ? m180[0].replace(/<[^>]+>/g, '') : 'None');
}

compareHtml();

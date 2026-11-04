// scripts/test-homepage-links.mjs
const res = await fetch('https://www.sujatanutrilive.com/');
const html = await res.text();
const matches = html.match(/href="\/product\/[^"]+"/g) || [];
console.log('Homepage product links count:', matches.length);
const unique = [...new Set(matches.map(m => m.replace('href="', '').replace('"', '')))];
console.log('Unique product URLs count:', unique.length);
console.log('Unique product URLs:', unique);

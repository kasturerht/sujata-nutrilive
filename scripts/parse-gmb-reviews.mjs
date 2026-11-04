// scripts/parse-gmb-reviews.mjs
import fs from 'fs';

const html = fs.readFileSync('scripts/gmb_page.html', 'utf8');

// Search for strings around "Sujata Nutrilive" or reviews
const lines = html.split('\n');
console.log('Total lines:', lines.length);

// Let's search for review snippets, star ratings, or names
const matches = [];
const regex = />([^<]{15,300})</g;
let m;
while ((m = regex.exec(html)) !== null) {
  const text = m[1].trim();
  if (text.length > 20 && !text.includes('{') && !text.includes('function') && !text.includes('var ')) {
    matches.push(text);
  }
}

console.log('Sample text snippets found:');
matches.filter(t => 
  t.toLowerCase().includes('spirulina') || 
  t.toLowerCase().includes('sujata') || 
  t.toLowerCase().includes('product') || 
  t.toLowerCase().includes('good') ||
  t.toLowerCase().includes('best') ||
  t.toLowerCase().includes('result') ||
  t.toLowerCase().includes('month') ||
  t.toLowerCase().includes('energy') ||
  t.toLowerCase().includes('review')
).slice(0, 30).forEach((t, i) => console.log(`${i + 1}: ${t}`));

import fs from 'fs';

const html = fs.readFileSync('reports/b12_page.html', 'utf8');
const formMatch = html.match(/<form[^>]*id="addToCart"[^>]*>([\s\S]*?)<\/form>/);
console.log('Form inside b12_page.html:');
if (formMatch) {
  console.log(formMatch[1].slice(0, 400).replace(/\s+/g, ' '));
} else {
  console.log('No form#addToCart');
}

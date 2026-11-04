// scripts/fetch-kg-reviews.mjs
import fs from 'fs';

async function run() {
  const url = 'https://www.google.com/search?q=Sujata+Nutrilive+Agrotech+Nashik&tbm=lcl';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'mr-IN,mr;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  });

  const text = await res.text();
  console.log('Status:', res.status, 'Length:', text.length);
  fs.writeFileSync('scripts/lcl_page.html', text, 'utf8');

  // Check if any reviews or ratings are present
  const regex = /"(.*?)"/g;
  // search for words like star, review, etc.
  const lines = text.split('\n');
  console.log('Lines count:', lines.length);
}

run();

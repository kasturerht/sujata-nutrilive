import fs from 'fs';

async function testSB() {
  const res = await fetch('https://www.amazon.in/dp/B0HMJHWLV3', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-IN,en;q=0.9'
    }
  });
  const html = await res.text();
  fs.writeFileSync('reports/sb_page.html', html);
  console.log('Saved sb_page.html, size:', html.length);

  const bbIdx = html.indexOf('id="desktop_buybox"');
  console.log('desktop_buybox index:', bbIdx);
  if (bbIdx !== -1) {
    console.log('Buybox snippet:', html.substring(bbIdx, bbIdx + 2000).replace(/\s+/g, ' '));
  }
}

testSB();

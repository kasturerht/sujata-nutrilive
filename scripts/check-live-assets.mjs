// scripts/check-live-assets.mjs
async function checkAssets() {
  const url = 'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack';
  const res = await fetch(url);
  const html = await res.text();
  console.log('HTML status:', res.status, 'HTML length:', html.length);

  const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
  const imgs = [];
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    imgs.push(m[1]);
  }
  console.log('Total images found on PDP:', imgs.length);

  let broken = 0;
  for (const src of imgs.slice(0, 15)) {
    const fullUrl = src.startsWith('http') ? src : 'https://www.sujatanutrilive.com' + src;
    try {
      const iRes = await fetch(fullUrl, { method: 'HEAD' });
      if (!iRes.ok) {
        console.log('Broken img:', fullUrl, iRes.status);
        broken++;
      }
    } catch(e) {
      console.log('Err img:', fullUrl, e.message);
      broken++;
    }
  }
  if (broken === 0) console.log('All checked PDP images loaded perfectly (200 OK)');
}

checkAssets().catch(console.error);

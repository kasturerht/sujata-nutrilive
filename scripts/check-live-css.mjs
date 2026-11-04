async function check() {
  const res = await fetch('https://www.sujatanutrilive.com/product/sujata-spirulina-tablets?t=' + Date.now(), {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const html = await res.text();
  const matches = [...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)].map(m => m[1]);
  console.log('Found CSS files in live HTML:', matches);
  for (const m of matches) {
    const r = await fetch('https://www.sujatanutrilive.com' + m);
    const css = await r.text();
    console.log(m, 'has JudgemeStar:', css.includes('JudgemeStar'));
    if (css.includes('JudgemeStar')) {
      console.log('SUCCESS! Star font and styling is LIVE on Sujata Nutrilive!');
    }
  }
}
check();

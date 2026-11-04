async function check() {
  for (let i = 1; i <= 6; i++) {
    await new Promise(r => setTimeout(r, 5000));
    try {
      const res = await fetch('https://www.sujatanutrilive.com/?t=' + Date.now(), { headers: { 'Cache-Control': 'no-cache' } });
      const html = await res.text();
      const has = html.includes('diwali-hero');
      console.log(`Poll ${i}: has diwali-hero = ${has}`);
      if (!has) {
        console.log('✅ Revert is now LIVE and site is 100% clean!');
        return;
      }
    } catch(e) {
      console.log('Error:', e.message);
    }
  }
}
check();

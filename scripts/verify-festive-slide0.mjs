async function verifyDeployment() {
  for (let i = 1; i <= 8; i++) {
    await new Promise(r => setTimeout(r, 6000));
    try {
      const res = await fetch('https://www.sujatanutrilive.com/?v=' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const html = await res.text();
      const hasDiwaliTab = html.includes('data-tab-index="0"') && html.includes('Diwali');
      const hasSlide0 = html.includes('id="hero-slide-0"');
      const hasSlide3 = html.includes('id="hero-slide-3"');
      console.log(`Poll ${i}: HTTP ${res.status}, hasDiwaliTab: ${hasDiwaliTab}, hasSlide0: ${hasSlide0}, hasSlide3: ${hasSlide3}`);
      if (hasDiwaliTab && hasSlide0 && hasSlide3) {
        console.log('🎉 4-SLIDE FESTIVE HERO IS LIVE ON PRODUCTION!');
        return;
      }
    } catch(e) {
      console.log('Error:', e.message);
    }
  }
}
verifyDeployment();

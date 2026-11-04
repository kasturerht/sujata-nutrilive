async function checkLive() {
  for (let i = 1; i <= 8; i++) {
    await new Promise(r => setTimeout(r, 6000));
    try {
      const res = await fetch('https://www.sujatanutrilive.com/?v=' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const html = await res.text();
      const hasHamper = html.includes('diwali-hamper-showcase.webp');
      const hasHeading = html.includes('SHUBH DIWALI');
      const hasOffer1 = html.includes('1-Month Pack') && html.includes('1,050');
      const hasOffer2 = html.includes('2-Month Pack') && html.includes('1,700');
      const hasOffer3 = html.includes('3-Month Mega') && html.includes('2,400');
      const hasSlide1 = html.includes('id="hero-slide-1"');
      const hasSlide2 = html.includes('id="hero-slide-2"');
      const hasSlide3 = html.includes('id="hero-slide-3"');
      
      console.log(`Poll ${i}: HTTP ${res.status}, hasHamper: ${hasHamper}, hasHeading: ${hasHeading}, offers: ${hasOffer1 && hasOffer2 && hasOffer3}, allSlides: ${hasSlide1 && hasSlide2 && hasSlide3}`);
      if (hasHamper && hasHeading && hasOffer1 && hasOffer2 && hasOffer3 && hasSlide1 && hasSlide2 && hasSlide3) {
        console.log('🎉 NATIVE 2-COLUMN LUXURY FESTIVE HERO IS 100% LIVE ON PRODUCTION!');
        return;
      }
    } catch(e) {
      console.log('Error:', e.message);
    }
  }
}
checkLive();

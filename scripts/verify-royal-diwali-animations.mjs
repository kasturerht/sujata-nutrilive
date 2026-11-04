async function verifyAnimationSuite() {
  for (let i = 1; i <= 8; i++) {
    await new Promise(r => setTimeout(r, 6000));
    try {
      const res = await fetch('https://www.sujatanutrilive.com/?v=' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const html = await res.text();
      const hasStardust = html.includes('stardust-particle');
      const hasDiyaGlow = html.includes('animate-diya-glow');
      const hasGoldSweep = html.includes('btn-gold-sweep');
      const hasCardGlow = html.includes('card-best-value-glow');
      
      console.log(`Poll ${i}: HTTP ${res.status}, stardust: ${hasStardust}, diyaGlow: ${hasDiyaGlow}, goldSweep: ${hasGoldSweep}, cardGlow: ${hasCardGlow}`);
      if (hasStardust && hasDiyaGlow && hasGoldSweep && hasCardGlow) {
        console.log('🎉 ROYAL DIWALI ANIMATION SUITE IS 100% LIVE ON PRODUCTION!');
        return;
      }
    } catch(e) {
      console.log('Error:', e.message);
    }
  }
}
verifyAnimationSuite();

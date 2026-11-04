async function poll() {
  for (let i = 1; i <= 6; i++) {
    await new Promise(r => setTimeout(r, 6000));
    try {
      const res = await fetch('https://www.sujatanutrilive.com/?v=' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const html = await res.text();
      const hasBanner = html.includes('diwali-hero');
      console.log(`Attempt ${i}: HTTP ${res.status}, hasBanner: ${hasBanner}`);
      if (hasBanner) {
        console.log('🎉 LIVE VERIFICATION SUCCESSFUL!');
        return;
      }
    } catch(e) {
      console.log('Error:', e.message);
    }
  }
}
poll();

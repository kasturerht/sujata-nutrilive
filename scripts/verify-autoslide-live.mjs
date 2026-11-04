import fetch from 'node-fetch';

async function checkLive() {
  const url = 'https://www.sujatanutrilive.com/?t=' + Date.now();
  try {
    const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    const html = await res.text();
    const hasFix = html.includes('isAutoScrolling') && html.includes('__sujataHeroAutoPlayTimer');

    console.log('--- LIVE AUTOPLAY FIX VERIFICATION ---');
    console.log('Status:', res.status);
    console.log('hasFix:', hasFix);

    if (hasFix) {
      console.log('>>> BULLETPROOF AUTO-SLIDING ENGINE IS LIVE ON SUJATANUTRILIVE.COM! <<<');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error fetching live site:', err.message);
    return false;
  }
}

async function poll() {
  for (let i = 0; i < 10; i++) {
    const ok = await checkLive();
    if (ok) break;
    console.log(`Waiting for Vercel deployment... retry ${i + 1}/10`);
    await new Promise(r => setTimeout(r, 6000));
  }
}

poll();

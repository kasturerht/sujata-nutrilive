import fetch from 'node-fetch';

async function checkLive() {
  const url = 'https://www.sujatanutrilive.com/?t=' + Date.now();
  try {
    const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    const html = await res.text();
    const hasActiveReveal = html.includes('active-reveal');
    const hasFestiveHamper = html.includes('festive-hamper-reveal');
    const hasFestiveBadge = html.includes('festive-badge-reveal');
    const hasCardCascade = html.includes('festive-card-1');
    const hasKeyframes = html.includes('hamperReveal');

    console.log('--- LIVE VERIFICATION ---');
    console.log('Status:', res.status);
    console.log('hasActiveReveal:', hasActiveReveal);
    console.log('hasFestiveHamper:', hasFestiveHamper);
    console.log('hasFestiveBadge:', hasFestiveBadge);
    console.log('hasCardCascade:', hasCardCascade);
    console.log('hasKeyframes:', hasKeyframes);

    if (hasActiveReveal && hasFestiveHamper && hasCardCascade) {
      console.log('>>> DEPLOYMENT IS LIVE ON SUJATANUTRILIVE.COM! <<<');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error fetching live site:', err.message);
    return false;
  }
}

async function poll() {
  for (let i = 0; i < 8; i++) {
    const ok = await checkLive();
    if (ok) break;
    console.log(`Waiting for Vercel deployment... retry ${i + 1}/8`);
    await new Promise(r => setTimeout(r, 6000));
  }
}

poll();

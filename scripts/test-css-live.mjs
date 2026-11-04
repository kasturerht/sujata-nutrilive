import fetch from 'node-fetch';

async function check() {
  const html = await (await fetch('https://www.sujatanutrilive.com/?nocache=' + Date.now())).text();
  const cssMatches = [...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)].map(m => m[1]);
  console.log('Found CSS files:', cssMatches);
  for (const cssUrl of cssMatches) {
    const cssText = await (await fetch('https://www.sujatanutrilive.com' + cssUrl)).text();
    if (cssText.includes('hamperReveal') || cssText.includes('cardCascade')) {
      console.log('SUCCESS! FOUND ENTRANCE ANIMATIONS in:', cssUrl);
      console.log('Includes hamperReveal:', cssText.includes('hamperReveal'));
      console.log('Includes cardCascade:', cssText.includes('cardCascade'));
      console.log('Includes ctaGlideIn:', cssText.includes('ctaGlideIn'));
      console.log('Includes festiveFadeUp:', cssText.includes('festiveFadeUp'));
      return true;
    }
  }
  return false;
}
check();

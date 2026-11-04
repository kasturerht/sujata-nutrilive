// scripts/test-merchant-feed-live.mjs
const res = await fetch('https://www.sujatanutrilive.com/google-merchant-feed.xml');
const xml = await res.text();
const items = xml.split('<item>');
for (const item of items) {
  if (item.includes('67604020002948') || item.includes('180 Capsules')) {
    const title = item.match(/<g:title>([^<]+)<\/g:title>/)?.[1];
    const avail = item.match(/<g:availability>([^<]+)<\/g:availability>/)?.[1];
    const price = item.match(/<g:price>([^<]+)<\/g:price>/)?.[1];
    console.log('Live Merchant Feed for 180 Caps:', { title, avail, price });
  }
}

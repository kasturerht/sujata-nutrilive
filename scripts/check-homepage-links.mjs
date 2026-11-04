// scripts/check-homepage-links.mjs
async function run() {
  const res = await fetch('https://www.sujatanutrilive.com');
  const html = await res.text();
  const matches = [...html.matchAll(/href=["'](\/product\/[^"']+)["']/g)].map(m => m[1]);
  const unique = [...new Set(matches)];
  console.log(`Found ${unique.length} unique product links in homepage HTML:`);
  unique.forEach(u => console.log('  *', u));

  // Find occurrences of node.handle
  const lines = html.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('node.handle')) {
      console.log(`Found node.handle on line ${idx + 1}: ${l.slice(0, 150)}`);
    }
  });

}

run().catch(console.error);

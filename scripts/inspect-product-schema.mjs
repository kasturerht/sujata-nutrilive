// scripts/inspect-product-schema.mjs
async function run() {
  const url = process.argv[2] || 'https://www.sujatanutrilive.com/product/sujata-spirulina-tablets';
  console.log(`Fetching HTML from: ${url}`);
  const res = await fetch(url);
  const html = await res.text();
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null) {
    count++;
    try {
      const obj = JSON.parse(match[1].trim());
      const findProducts = (o) => {
        if (!o) return;
        if (Array.isArray(o)) o.forEach(findProducts);
        else if (o['@type'] === 'Product') {
          console.log('\n--- FOUND PRODUCT TYPE ---');
          console.log('Name:', o.name);
          console.log('ID:', o['@id']);
          console.log('Offers:', JSON.stringify(o.offers, null, 2));
          console.log('AggregateRating:', JSON.stringify(o.aggregateRating, null, 2));
          console.log('Reviews count:', Array.isArray(o.review) ? o.review.length : o.review ? 1 : 0);
          console.log('All keys:', Object.keys(o));
        } else if (o['@graph']) {
          findProducts(o['@graph']);
        }
      };
      findProducts(obj);
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  }

  // Check microdata
  const itemtypes = [...html.matchAll(/itemtype=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log('\n--- MICRODATA ITEMTYPES ---');
  console.log(itemtypes);

  // Check Judge.me HTML snippet
  const jmMatches = [...html.matchAll(/jdgm-[^"'\s>]+/gi)].map(m => m[0]);
  console.log('\nJudge.me classes count:', jmMatches.length);
  const jmSchemaMatches = [...html.matchAll(/<div[^>]*class=["'][^"']*jdgm[^"']*["'][^>]*>/gi)].map(m => m[0]);
  console.log('Judge.me wrappers:', jmSchemaMatches.slice(0, 5));

}

run().catch(console.error);

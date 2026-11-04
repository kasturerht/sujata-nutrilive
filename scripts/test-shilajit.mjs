async function testShilajit() {
  const url = 'https://www.sujatanutrilive.com/product/sujata-pure-himalayan-shilajit';
  const t0 = Date.now();
  const res = await fetch(url);
  const t1 = Date.now();
  console.log('Status:', res.status, `(${t1 - t0}ms)`);
  const html = await res.text();
  console.log('HTML length:', html.length);
  console.log('Has reviews section:', html.includes('id="reviews-section"'));
  console.log('Badge text:', html.includes('Be the first to review') ? 'Be the first to review' : 'other');
  console.log('Product ID bound (10465847378052):', html.includes('data-id="10465847378052"'));
  console.log('Tablets review leaked:', html.includes('Best Odorless Pure Spirulina'));
}
testShilajit().catch(console.error);

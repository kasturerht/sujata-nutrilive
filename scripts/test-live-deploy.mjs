async function check() {
  const res = await fetch('https://www.sujatanutrilive.com/product/sujata-spirulina-tablets', {
    headers: { 'Cache-Control': 'no-cache' }
  });
  const html = await res.text();
  console.log('Status:', res.status, 'HTML length:', html.length);
  console.log('Has reviews-section:', html.includes('id="reviews-section"'));
  console.log('Has jdgm-review-widget:', html.includes('jdgm-review-widget'));
  console.log('Has jdgm-preview-badge:', html.includes('jdgm-preview-badge'));
}
check();

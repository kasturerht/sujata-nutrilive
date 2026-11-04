const token = '1S3X_MR--dEFToT4LdW_H_S1B-s';
const domain = 'tvczdq-nu.myshopify.com';

async function testEndpoints() {
  const eps = ['preview_badge', 'product_review'];
  for (const ep of eps) {
    const url = `https://judge.me/api/v1/widgets/${ep}?api_token=${token}&shop_domain=${domain}&handle=sujata-spirulina-tablets`;
    const res = await fetch(url);
    console.log(ep, "Status:", res.status);
    const data = await res.json();
    console.log(ep, "Data:", JSON.stringify(data).slice(0, 300));
  }
}
testEndpoints().catch(console.error);

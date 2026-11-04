const token = '1S3X_MR--dEFToT4LdW_H_S1B-s';
const domain = 'tvczdq-nu.myshopify.com';
const handle = 'sujata-spirulina-powder';

async function test() {
  const [bRes, wRes] = await Promise.all([
    fetch(`https://judge.me/api/v1/widgets/preview_badge?api_token=${token}&shop_domain=${domain}&handle=${handle}`),
    fetch(`https://judge.me/api/v1/widgets/product_review?api_token=${token}&shop_domain=${domain}&handle=${handle}`)
  ]);
  const bData = await bRes.json();
  const wData = await wRes.json();
  console.log('Badge for powder:');
  console.log(bData.badge);
  console.log('Widget for powder length:', wData.widget?.length);
  console.log('Widget preview for powder:');
  console.log(wData.widget?.slice(0, 500));
}
test().catch(console.error);

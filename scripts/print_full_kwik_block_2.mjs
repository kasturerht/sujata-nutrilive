// scripts/print_full_kwik_block_2.mjs
async function inspectBlock() {
  const testUrl = 'https://tvczdq-nu.myshopify.com?gkref=oICf237JYn5ZMP9yPUcMeiFpfFcr%2FecmaYcxJkX9fxQH6qAMCg8G2YtgtDilyjxZxbFGc6joRLeAca4LxomwSR7rKJyxXOhvulOjgjjSRHbCTNcxxNILhfB8vNLGIsz3ohopoGWVY2EVuZODGuPCGFPCBUQHY61x6QuEk%2F8%3D';
  const res = await fetch(testUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    cache: 'no-store'
  });
  const html = await res.text();
  const idx = html.indexOf('window.gkShopifySessionId');
  console.log(html.slice(idx, idx + 4000));
}

inspectBlock();

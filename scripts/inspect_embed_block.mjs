// scripts/inspect_embed_block.mjs
async function inspectBlock() {
  const testUrl = 'https://tvczdq-nu.myshopify.com?gkref=oICf237JYn5ZMP9yPUcMeiFpfFcr%2FecmaYcxJkX9fxQH6qAMCg8G2YtgtDilyjxZxbFGc6joRLeAca4LxomwSR7rKJyxXOhvulOjgjjSRHbCTNcxxNILhfB8vNLGIsz3ohopoGWVY2EVuZODGuPCGFPCBUQHY61x6QuEk%2F8%3D';
  const res = await fetch(testUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    cache: 'no-store'
  });
  const html = await res.text();
  const startIdx = html.indexOf('BEGIN app block: shopify://apps/kwik-cod-checkout/blocks/app-embed');
  const endIdx = html.indexOf('END app block: shopify://apps/kwik-cod-checkout/blocks/app-embed');
  if (startIdx !== -1 && endIdx !== -1) {
    console.log(html.slice(startIdx, endIdx + 70));
  } else {
    console.log("Block not found by tags, searching for gokwikSdk.js...");
    const idx = html.indexOf('gokwikSdk.js');
    console.log(html.slice(idx - 200, idx + 500));
  }
}

inspectBlock();

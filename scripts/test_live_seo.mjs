async function testLive() {
  const urls = [
    'https://www.sujatanutrilive.com/',
    'https://www.sujatanutrilive.com/product/sujata-spirulina-capsules',
    'https://www.sujatanutrilive.com/product/sujata-spirulina-powder',
    'https://www.sujatanutrilive.com/product/sujata-spirulina-tablets',
    'https://www.sujatanutrilive.com/robots.txt',
    'https://www.sujatanutrilive.com/sitemap-index.xml',
    'https://www.sujatanutrilive.com/llms.txt'
  ];

  for (const url of urls) {
    console.log(`\n=================== Testing: ${url} ===================`);
    try {
      const res = await fetch(url);
      console.log('HTTP Status:', res.status);
      const text = await res.text();
      if (url.endsWith('.txt') || url.endsWith('.xml')) {
        console.log('Content snippet (first 300 chars):');
        console.log(text.substring(0, 300));
        continue;
      }
      const canMatch = text.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
      console.log('Canonical tag:', canMatch ? canMatch[1] : 'NOT FOUND');
      const ogMatch = text.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
      console.log('og:url tag:', ogMatch ? ogMatch[1] : 'NOT FOUND');
      const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
      console.log('Title:', titleMatch ? titleMatch[1].trim() : 'NOT FOUND');
    } catch(e) {
      console.error('Error fetching', url, e.message);
    }
  }
}

testLive();

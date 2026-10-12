// scripts/deep-360-audit.mjs
// 🌐 360-DEGREE TECHNICAL & STRATEGIC AUDIT TOOL (OCTOBER 2026)
// Tests Performance, TTFB, SEO, AEO, SGEO, Schema, Knowledge Graph, and Citations

const SITE_ROOT = 'https://www.sujatanutrilive.com';
const URLS_TO_AUDIT = [
  '/',
  '/science',
  '/learn/best-spirulina-brand-in-india',
  '/learn/which-company-sea-buckthorn-is-best',
  '/learn/spirulina-in-marathi',
  '/product/sujata-spirulina-powder',
  '/product/sujata-spirulina-tablets',
  '/product/sujata-spirulina-capsules',
  '/product/sujata-sea-buckthorn-capsules',
  '/product/sujata-spirulina-sea-buckthorn-combo-pack',
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/sitemap-index.xml',
  '/google-merchant-feed.xml'
];

async function auditUrl(path) {
  const fullUrl = `${SITE_ROOT}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'
      }
    });
    const ttfb = Date.now() - start;
    const status = res.status;
    const contentType = res.headers.get('content-type') || '';
    const cacheControl = res.headers.get('cache-control') || '';
    const vercelCache = res.headers.get('x-vercel-cache') || '';
    const text = await res.text();
    const sizeKb = (Buffer.byteLength(text, 'utf8') / 1024).toFixed(1);

    // Parse HTML features if text/html
    let title = '';
    let metaDesc = '';
    let canonical = '';
    let hasOg = false;
    let jsonLdCount = 0;
    let schemaTypes = [];
    let hasH1 = false;
    let h1Text = '';
    let h2Count = 0;
    let tableCount = 0;
    let hasDois = false;

    if (contentType.includes('text/html')) {
      title = text.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() || '';
      metaDesc = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() || '';
      canonical = text.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)?.[1]?.trim() || '';
      hasOg = /property=["']og:title["']/i.test(text);
      hasH1 = /<h1/i.test(text);
      h1Text = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, '').trim() || '';
      h2Count = [...text.matchAll(/<h2/gi)].length;
      tableCount = [...text.matchAll(/<table/gi)].length;
      hasDois = /doi\.org|ncbi\.nlm\.nih\.gov|pubmed/i.test(text);

      const jsonLdMatches = [...text.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
      jsonLdCount = jsonLdMatches.length;

      jsonLdMatches.forEach(m => {
        try {
          const parsed = JSON.parse(m[1]);
          if (parsed['@graph']) {
            parsed['@graph'].forEach(g => {
              if (g['@type']) schemaTypes.push(Array.isArray(g['@type']) ? g['@type'].join('+') : g['@type']);
            });
          } else if (parsed['@type']) {
            schemaTypes.push(Array.isArray(parsed['@type']) ? parsed['@type'].join('+') : parsed['@type']);
          }
        } catch (e) {}
      });
    }

    return {
      path,
      status,
      ttfb: `${ttfb}ms`,
      size: `${sizeKb} KB`,
      contentType: contentType.split(';')[0],
      cache: vercelCache || (cacheControl ? 'Browser/Edge' : 'None'),
      title: title.slice(0, 45) + (title.length > 45 ? '...' : ''),
      canonical: canonical ? (canonical.startsWith('https://www.sujatanutrilive.com') ? '✓ Valid www' : '❌ ' + canonical) : 'N/A',
      schemas: schemaTypes.length > 0 ? schemaTypes.slice(0, 4).join(', ') : 'None',
      tableCount,
      h2Count,
      hasDois
    };
  } catch (err) {
    return { path, error: err.message };
  }
}

async function runAudit() {
  console.log('================================================================================');
  console.log('🔬 SUJATA NUTRILIVE: 360-DEGREE TECHNICAL & STRATEGIC AUDIT (OCTOBER 2026)');
  console.log('================================================================================\n');

  console.log('📊 Probing live site infrastructure across 15 core endpoints...\n');

  const results = [];
  for (const url of URLS_TO_AUDIT) {
    const res = await auditUrl(url);
    results.push(res);
  }

  console.table(results.map(r => ({
    Path: r.path,
    Status: r.status,
    TTFB: r.ttfb,
    Size: r.size,
    Canonical: r.canonical,
    Schemas: r.schemas,
    Tables: r.tableCount,
    H2s: r.h2Count,
    DOI: r.hasDois ? '✓' : '-'
  })));

  console.log('\n================================================================================');
  console.log('🏁 360-DEGREE AUDIT PROBE COMPLETED');
  console.log('================================================================================');
}

runAudit();

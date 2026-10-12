// scripts/diagnose-ai-ranking.mjs
// 🔍 FORENSIC AI RANKING & CRAWL DIAGNOSTIC TOOL (OCTOBER 2026)
// Probes DNS, SSL, HTTP redirects, bot crawler accessibility, Schema, LLM files, and GEO factors

import dns from 'dns/promises';
import https from 'https';

const TARGET_HOSTS = ['sujatanutrilive.com', 'www.sujatanutrilive.com'];
const PATHS_TO_TEST = [
  '/',
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/sitemap-index.xml',
  '/science',
  '/product/sujata-spirulina-powder',
  '/product/sujata-spirulina-sea-buckthorn-combo-pack'
];

const BOT_USER_AGENTS = [
  { name: 'Standard Browser (Chrome 130)', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' },
  { name: 'OAI-SearchBot (ChatGPT Search)', ua: 'OAI-SearchBot/1.0; (+https://openai.com/searchbot)' },
  { name: 'ChatGPT-User (ChatGPT Browsing)', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot' },
  { name: 'PerplexityBot (Perplexity AI)', ua: 'PerplexityBot/1.0; (+https://perplexity.ai/perplexitybot)' },
  { name: 'ClaudeBot (Anthropic AI)', ua: 'ClaudeBot/1.0; (+https://www.anthropic.com/claudebot)' },
  { name: 'Googlebot (Google Search)', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
  { name: 'Google-Extended (Gemini RAG)', ua: 'Google-Extended; (+https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)' }
];

async function probeUrl(url, userAgent) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'manual'
    });

    const status = res.status;
    const location = res.headers.get('location') || '';
    const contentType = res.headers.get('content-type') || '';
    const xRobots = res.headers.get('x-robots-tag') || 'none';
    const server = res.headers.get('server') || '';
    const cacheControl = res.headers.get('cache-control') || '';
    
    let bodySnippet = '';
    if (status === 200 || status === 301 || status === 302 || status === 308) {
      const text = await res.text();
      bodySnippet = text.slice(0, 300);
    }

    return {
      status,
      location,
      contentType,
      xRobots,
      server,
      cacheControl,
      bodySnippet
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function runDiagnostic() {
  console.log('===============================================================');
  console.log('🔬 SUJATA NUTRILIVE: FORENSIC AI RANKING & CRAWL DIAGNOSIS (2026)');
  console.log('===============================================================\n');

  // 1. DNS Resolution
  console.log('1️⃣  DNS RESOLUTION CHECK:');
  for (const host of TARGET_HOSTS) {
    try {
      const aRecords = await dns.resolve4(host);
      console.log(`  ✓ ${host} -> IPv4: ${aRecords.join(', ')}`);
    } catch (e) {
      console.error(`  ❌ ${host} -> DNS Error: ${e.message}`);
    }
  }
  console.log('');

  // 2. Apex to WWW Redirect Verification
  console.log('2️⃣  CANONICAL REDIRECT BEHAVIOR (sujatanutrilive.com vs www.sujatanutrilive.com):');
  const apexProbes = [
    'http://sujatanutrilive.com/',
    'https://sujatanutrilive.com/',
    'http://www.sujatanutrilive.com/',
    'https://www.sujatanutrilive.com/'
  ];
  for (const pUrl of apexProbes) {
    const res = await probeUrl(pUrl, BOT_USER_AGENTS[0].ua);
    console.log(`  • ${pUrl.padEnd(35)} -> Status: ${res.status} | Location: ${res.location || '(none)'}`);
  }
  console.log('');

  // 3. AI Bot Access Matrix
  console.log('3️⃣  AI SEARCH BOT ACCESSIBILITY MATRIX (Testing on https://www.sujatanutrilive.com/):');
  for (const bot of BOT_USER_AGENTS) {
    const resHome = await probeUrl('https://www.sujatanutrilive.com/', bot.ua);
    const resLlms = await probeUrl('https://www.sujatanutrilive.com/llms.txt', bot.ua);
    const resRobots = await probeUrl('https://www.sujatanutrilive.com/robots.txt', bot.ua);
    
    console.log(`  🤖 ${bot.name.padEnd(35)}:`);
    console.log(`     /             -> Status: ${resHome.status} | X-Robots: ${resHome.xRobots}`);
    console.log(`     /robots.txt   -> Status: ${resRobots.status}`);
    console.log(`     /llms.txt     -> Status: ${resLlms.status} | Type: ${resLlms.contentType}`);
  }
  console.log('');

  // 4. Live Schema & Entity Inspection on Product Page
  console.log('4️⃣  PRODUCT PAGE CANONICAL & JSON-LD AUDIT (/product/sujata-spirulina-powder):');
  try {
    const pUrl = 'https://www.sujatanutrilive.com/product/sujata-spirulina-powder';
    const res = await fetch(pUrl, {
      headers: { 'User-Agent': BOT_USER_AGENTS[1].ua } // Test as OAI-SearchBot
    });
    const html = await res.text();

    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : 'MISSING';
    
    const jsonLdBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    
    console.log(`  • Status: ${res.status}`);
    console.log(`  • Canonical URL declared: ${canonical}`);
    console.log(`  • JSON-LD Blocks Found: ${jsonLdBlocks.length}`);

    jsonLdBlocks.forEach((b, idx) => {
      try {
        const parsed = JSON.parse(b[1]);
        const type = parsed['@type'] || (parsed['@graph'] ? parsed['@graph'].map(g => g['@type']).join(', ') : 'Unknown');
        console.log(`    - Block ${idx + 1}: @type = ${type}`);
      } catch (err) {
        console.log(`    - Block ${idx + 1}: JSON Parse Error: ${err.message}`);
      }
    });

    // Check for noindex
    const hasNoIndex = /noindex/i.test(html);
    console.log(`  • Accidental 'noindex' detected in HTML? ${hasNoIndex ? '❌ YES (CRITICAL BUG)' : '✓ NO (CLEAN)'}`);

  } catch (e) {
    console.error(`  ❌ Failed to inspect product page: ${e.message}`);
  }
  console.log('');

  // 5. Wikidata Entity Verification
  console.log('5️⃣  WIKIDATA CANONICAL ENTITY CHECK (Q141656957):');
  try {
    const wikiUrl = 'https://www.wikidata.org/wiki/Special:EntityData/Q141656957.json';
    const wRes = await fetch(wikiUrl);
    if (wRes.ok) {
      const wData = await wRes.json();
      const entity = wData.entities?.Q141656957;
      if (entity) {
        const label = entity.labels?.en?.value || 'No English Label';
        const desc = entity.descriptions?.en?.value || 'No Description';
        console.log(`  ✓ Wikidata Q141656957 is LIVE:`);
        console.log(`    Label: "${label}"`);
        console.log(`    Description: "${desc}"`);
      } else {
        console.log(`  ⚠️ Wikidata returned empty entity`);
      }
    } else {
      console.log(`  ❌ Wikidata request failed: HTTP ${wRes.status}`);
    }
  } catch (we) {
    console.log(`  ❌ Wikidata fetch error: ${we.message}`);
  }

  console.log('\n===============================================================');
  console.log('🏁 DIAGNOSIS COMPLETE');
  console.log('===============================================================');
}

runDiagnostic();

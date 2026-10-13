// scripts/bing-engine.mjs
// 🌐 SUJATA NUTRILIVE: BING WEBMASTER & CHATGPT SEARCH DIRECT INTEGRATION
// Submits sitemaps, checks Bing indexing, and pushes all URLs to Bingbot & Copilot/ChatGPT index

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    env[trimmed.slice(0, idx).trim()] = val;
  }
});

const API_KEY = env.BING_WEBMASTER_API_KEY || '1bbfc339d1694faca20192c09c3310c4';
const BASE_URL = 'https://ssl.bing.com/webmaster/api.svc/json';
const SITE_URL = 'https://www.sujatanutrilive.com';

async function main() {
  console.log('================================================================');
  console.log('🌐 BING WEBMASTER TOOLS & CHATGPT SEARCH LIVE INTEGRATION');
  console.log('================================================================\n');

  // 1. Verify User Sites
  console.log('--- 1. VERIFYING SITES IN BING ACCOUNT ---');
  const sitesRes = await fetch(`${BASE_URL}/GetUserSites?apikey=${API_KEY}`);
  const sitesData = await sitesRes.json();
  console.log('Sites found in Bing account:', JSON.stringify(sitesData, null, 2));

  let verifiedSite = null;
  const sitesList = sitesData.d || [];
  for (const s of sitesList) {
    if (s.Url?.includes('sujatanutrilive.com')) {
      verifiedSite = s.Url;
      console.log(`✅ Found verified site in Bing: ${verifiedSite} (Role: ${s.AuthenticationCodes || 'Verified'})`);
      break;
    }
  }

  // If site not found, try adding it
  if (!verifiedSite) {
    console.log(`⚠️ Site not found in Bing account. Attempting to add ${SITE_URL}...`);
    const addRes = await fetch(`${BASE_URL}/AddSite?apikey=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl: SITE_URL })
    });
    const addData = await addRes.json();
    console.log('Add site response:', addData);
    verifiedSite = SITE_URL;
  }

  // 2. Check URL Submission Quota
  console.log('\n--- 2. CHECKING DAILY URL SUBMISSION QUOTA ---');
  try {
    const quotaRes = await fetch(`${BASE_URL}/GetUrlSubmissionQuota?siteUrl=${encodeURIComponent(verifiedSite)}&apikey=${API_KEY}`);
    const quotaData = await quotaRes.json();
    console.log('Daily Quota:', JSON.stringify(quotaData, null, 2));
  } catch(e) {
    console.log('Quota check note:', e.message);
  }

  // 3. Submit Sitemap to Bing
  console.log('\n--- 3. SUBMITTING SITEMAP TO BING ---');
  const sitemapUrl = `${SITE_URL}/sitemap-index.xml`;
  try {
    const smRes = await fetch(`${BASE_URL}/SubmitSitemap?apikey=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteUrl: verifiedSite,
        sitemapUrl: sitemapUrl
      })
    });
    const smData = await smRes.json();
    console.log('Sitemap submission result:', smData);
  } catch(e) {
    console.log('Sitemap submission note:', e.message);
  }

  // 4. Fetch all URLs from Live Sitemap
  console.log('\n--- 4. FETCHING ALL SITEMAP URLS FOR DIRECT BING PUSH ---');
  let targetUrls = [];
  try {
    const liveSmRes = await fetch(`${SITE_URL}/sitemap-0.xml`);
    if (liveSmRes.ok) {
      const xml = await liveSmRes.text();
      targetUrls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
    }
  } catch(e) {}

  if (targetUrls.length === 0) {
    targetUrls = [
      `${SITE_URL}/`,
      `${SITE_URL}/science`,
      `${SITE_URL}/product/sujata-spirulina-sea-buckthorn-combo-pack`,
      `${SITE_URL}/product/sujata-pure-himalayan-shilajit`,
      `${SITE_URL}/product/sujata-sea-buckthorn-capsules`,
      `${SITE_URL}/product/sujata-plant-based-vitamin-b12`,
      `${SITE_URL}/product/sujata-spirulina-powder`,
      `${SITE_URL}/product/sujata-spirulina-capsules`,
      `${SITE_URL}/product/sujata-spirulina-tablets`,
      `${SITE_URL}/product/sujata-spirulina-korean-cream`
    ];
  }
  console.log(`Loaded ${targetUrls.length} URLs to submit directly to Bing.`);

  // 5. Submit URLs in Batch (SubmitUrlbatch API)
  console.log('\n--- 5. SUBMITTING ALL URLS TO BING VIA SUBMITURLBATCH API ---');
  // Clean trailing slashes or submit unique URLs
  const uniqueUrls = Array.from(new Set(targetUrls));
  
  // Bing batch limit is usually 100-500 per call
  const batchRes = await fetch(`${BASE_URL}/SubmitUrlbatch?apikey=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      siteUrl: verifiedSite,
      urlList: uniqueUrls
    })
  });
  const batchData = await batchRes.json();
  console.log('Batch Submission Response:', JSON.stringify(batchData, null, 2));

  // 6. Check Crawl Stats from Bing
  console.log('\n--- 6. CHECKING RECENT BING CRAWL STATS ---');
  try {
    const statsRes = await fetch(`${BASE_URL}/GetCrawlStats?siteUrl=${encodeURIComponent(verifiedSite)}&apikey=${API_KEY}`);
    const statsData = await statsRes.json();
    console.log('Bing Crawl Stats:', JSON.stringify(statsData, null, 2));
  } catch(e) {
    console.log('Crawl stats note:', e.message);
  }

  console.log('\n================================================================');
  console.log('✅ BING WEBMASTER TOOLS & CHATGPT SEARCH SYNC COMPLETE');
  console.log('================================================================');
}

main().catch(console.error);

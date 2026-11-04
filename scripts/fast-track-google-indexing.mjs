// scripts/fast-track-google-indexing.mjs
// Silicon Valley Rapid Indexing Engine: Broadcast all 29 URLs directly to Google Indexing API
import fs from 'fs';
import crypto from 'crypto';

const key = JSON.parse(fs.readFileSync('scripts/sujata-nutrilive-seo-7e48e83a62a6.json', 'utf8'));

function createJwt(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: key.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = base64Url(header) + '.' + base64Url(payload);
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  return signInput + '.' + sign.sign(key.private_key, 'base64url');
}

async function getAccessToken() {
  const assertion = createJwt(['https://www.googleapis.com/auth/indexing']);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const data = await res.json();
  return data.access_token;
}

const products = [
  'sujata-spirulina-tablets',
  'sujata-spirulina-powder',
  'sujata-spirulina-capsules',
  'sujata-sea-buckthorn-capsules',
  'sujata-plant-based-vitamin-b12',
  'sujata-pure-himalayan-shilajit',
  'sujata-moringa-powder',
  'sujata-spirulina-facewash',
  'sujata-spirulina-facepack-powder',
  'sujata-spiruglow-bath-soap',
  'sujata-spirulina-korean-cream',
  'sujata-bridal-whitening-cream',
  'sujata-spirulina-coconut-hair-oil',
  'sujata-spirushine-shampoo-conditioner',
  'sujata-spirulina-sea-buckthorn-combo',
  'sujata-spirulina-sea-buckthorn-combo-pack'
];

const learnPages = [
  'best-spirulina-brand-in-india',
  'sea-buckthorn-in-hindi',
  'spirulina-in-marathi',
  'which-company-sea-buckthorn-is-best'
];

const corePages = [
  '',
  'science',
  'contact',
  'track-order',
  'privacy-policy',
  'refund-policy',
  'shipping-policy',
  'terms-of-service',
  'quiz'
];

const targetUrls = [
  ...products.map(p => `https://www.sujatanutrilive.com/product/${p}`),
  ...learnPages.map(l => `https://www.sujatanutrilive.com/learn/${l}`),
  ...corePages.map(c => c ? `https://www.sujatanutrilive.com/${c}` : 'https://www.sujatanutrilive.com/')
];

async function broadcastIndexing() {
  console.log(`================================================================`);
  console.log(`🚀 GOOGLE INDEXING API: INSTANT BROADCAST FOR ALL ${targetUrls.length} URLS`);
  console.log(`================================================================\n`);

  const token = await getAccessToken();
  console.log(`🔑 Service Account Access Token acquired successfully.\n`);

  const results = [];

  for (let i = 0; i < targetUrls.length; i++) {
    const url = targetUrls[i];
    process.stdout.write(`[${i + 1}/${targetUrls.length}] Pushing to Google Indexing Queue: ${url} ... `);

    try {
      const apiRes = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          type: 'URL_UPDATED'
        })
      });

      const resData = await apiRes.json();
      if (apiRes.ok) {
        console.log(`✅ QUEUED (HTTP 200)`);
        results.push({ url, status: 'QUEUED', data: resData });
      } else {
        console.log(`⚠️ Status ${apiRes.status}: ${resData.error?.message || 'Error'}`);
        results.push({ url, status: 'ERROR', error: resData.error });
      }

      // 500ms delay to respect quota
      await new Promise(r => setTimeout(r, 500));

    } catch (err) {
      console.log(`💥 Failed: ${err.message}`);
      results.push({ url, status: 'EXCEPTION', error: err.message });
    }
  }

  const successCount = results.filter(r => r.status === 'QUEUED').length;
  console.log(`\n================================================================`);
  console.log(`🎉 RESULT: ${successCount} / ${targetUrls.length} URLs successfully submitted to Google Indexing API!`);
  console.log(`================================================================\n`);

  fs.writeFileSync('scripts/indexing_broadcast_results.json', JSON.stringify(results, null, 2));
}

broadcastIndexing();

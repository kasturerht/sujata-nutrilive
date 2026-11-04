// scripts/gsc-inspect-all-products.mjs
// Inspect all 16 product URLs via Google Search Console URL Inspection API
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
  const assertion = createJwt(['https://www.googleapis.com/auth/webmasters.readonly']);
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

async function inspectAll() {
  const token = await getAccessToken();
  console.log('✅ GSC Access Token acquired.');

  const results = [];
  const siteUrl = 'https://www.sujatanutrilive.com/';

  for (let i = 0; i < products.length; i++) {
    const handle = products[i];
    const inspectionUrl = `https://www.sujatanutrilive.com/product/${handle}`;
    process.stdout.write(`[${i + 1}/${products.length}] Querying GSC API for: ${handle} ... `);

    try {
      const apiRes = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inspectionUrl,
          siteUrl
        })
      });

      const data = await apiRes.json();
      
      if (data.inspectionResult) {
        const indexStatus = data.inspectionResult.indexStatusResult;
        const richResults = data.inspectionResult.richResultsResult;
        
        const verdict = indexStatus?.verdict || 'UNKNOWN';
        const coverageState = indexStatus?.coverageState || 'UNKNOWN';
        const lastCrawlTime = indexStatus?.lastCrawlTime || 'Never';
        const richVerdict = richResults?.verdict || 'NONE';
        const richItems = richResults?.detectedItems?.map(item => ({
          type: item.richResultType,
          itemsCount: item.items?.length || 0,
          issues: item.items?.flatMap(it => it.issues?.map(iss => iss.issueMessage) || []) || []
        })) || [];

        console.log(`Verdict: ${verdict} | Rich: ${richVerdict} | Crawled: ${lastCrawlTime.split('T')[0] || 'Never'}`);
        results.push({
          handle,
          url: inspectionUrl,
          verdict,
          coverageState,
          lastCrawlTime,
          richVerdict,
          richItems
        });
      } else {
        console.log(`Error: ${JSON.stringify(data.error?.message || data)}`);
        results.push({ handle, error: data.error?.message });
      }

      // Small pause to be gentle with rate limits
      await new Promise(r => setTimeout(r, 600));

    } catch (err) {
      console.log(`Exception: ${err.message}`);
      results.push({ handle, error: err.message });
    }
  }

  fs.writeFileSync('scripts/gsc_product_inspection_results.json', JSON.stringify(results, null, 2));
  console.log('\nAudit complete! Saved to scripts/gsc_product_inspection_results.json');
}

inspectAll();

import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      process.env[trimmed.substring(0, idx).trim()] = val;
    }
  }
}
loadEnv();

async function getAccessToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.AMAZON_REFRESH_TOKEN,
      client_id: process.env.AMAZON_LWA_CLIENT_ID,
      client_secret: process.env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const data = await res.json();
  return data.access_token;
}

async function checkSubmissions() {
  const token = await getAccessToken();
  const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  const submissions = [
    { name: 'Parent SJT-SP-TAB-PARENT', id: 'b440c0936cc443f3a72b5036e2b0da26' },
    { name: 'Child 1 60 Tablets (8X-HQKV-14T7)', id: 'a74d55f8c6bb4cf2b83da98190001b7d' },
    { name: 'Child 2 120 Tablets (SJT-SP-TAB-120)', id: '1349b7c767bb44f99477d57ad656035d' }
  ];

  console.log("Checking Amazon Feeds / Submissions Status...");
  for (const s of submissions) {
    const url = `${endpoint}/feeds/2021-06-30/feeds/${s.id}`;
    const res = await fetch(url, {
      headers: {
        'x-amz-access-token': token,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log(`\nFeed: ${s.name}`);
    console.log(`Status: ${data.processingStatus || res.status}`);
    if (data.resultFeedDocumentId) {
      console.log(`Result Doc ID: ${data.resultFeedDocumentId}`);
    }
  }

  // Also check Parent Item details
  console.log("\n=======================================================");
  console.log("Checking Parent SKU 'SJT-SP-TAB-PARENT' on Listings API...");
  const parentUrl = `${endpoint}/listings/2021-08-01/items/${sellerId}/SJT-SP-TAB-PARENT?marketplaceIds=${marketId}&issueLocale=en_IN&includedData=summaries,attributes,issues`;
  const pRes = await fetch(parentUrl, {
    headers: { 'x-amz-access-token': token }
  });
  console.log("Parent Status Code:", pRes.status);
  const pData = await pRes.json();
  if (pData.summaries) {
    console.log("Parent Summaries:", JSON.stringify(pData.summaries, null, 2));
  }
  if (pData.issues && pData.issues.length > 0) {
    console.log("Parent Issues:", JSON.stringify(pData.issues, null, 2));
  } else {
    console.log("Parent has 0 issues!");
  }
}

checkSubmissions().catch(console.error);

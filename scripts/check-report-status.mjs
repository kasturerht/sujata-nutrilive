import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.substring(0, idx).trim()] = val;
      }
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

async function checkReport() {
  const token = await getAccessToken();
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';
  const reportId = '50993020735';

  const statusRes = await fetch(`${endpoint}/reports/2021-06-30/reports/${reportId}`, {
    headers: { 'x-amz-access-token': token }
  });
  const statusData = await statusRes.json();
  console.log('Report Status:', statusData);

  if (statusData.processingStatus === 'DONE' && statusData.reportDocumentId) {
    const docRes = await fetch(`${endpoint}/reports/2021-06-30/documents/${statusData.reportDocumentId}`, {
      headers: { 'x-amz-access-token': token }
    });
    const docData = await docRes.json();
    const contentRes = await fetch(docData.url);
    const content = await contentRes.text();
    fs.writeFileSync('data/seller-central-inventory-report.tsv', content);
    console.log(`Saved report! Bytes: ${content.length}`);

    const lines = content.split('\n');
    console.log(`Rows: ${lines.length}`);
    const headers = lines[0].split('\t');
    console.log('Headers count:', headers.length);
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = lines[i].split('\t');
      console.log(`Row ${i}: SKU: [${cols[3]}] | ASIN: [${cols[16] || cols[1]}] | Status: [${cols[28] || cols[15] || 'N/A'}] | Qty: [${cols[5]}] | Price: [${cols[4]}] | Name: [${cols[0]?.substring(0, 45)}]`);
    }
  }
}

checkReport().catch(console.error);

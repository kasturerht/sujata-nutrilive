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

// Request GET_MERCHANT_LISTINGS_ALL_DATA report from Reports API
async function getInventoryReport() {
  const token = await getAccessToken();
  const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
  const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

  console.log('Requesting GET_MERCHANT_LISTINGS_ALL_DATA report...');
  const createReportRes = await fetch(`${endpoint}/reports/2021-06-30/reports`, {
    method: 'POST',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reportType: 'GET_MERCHANT_LISTINGS_ALL_DATA',
      marketplaceIds: [marketId]
    })
  });

  const reportData = await createReportRes.json();
  console.log('Create Report Response:', reportData);
  if (!reportData.reportId) {
    console.error('Failed to create report');
    return;
  }

  const reportId = reportData.reportId;
  console.log(`Report created with ID: ${reportId}. Waiting for report generation...`);

  let reportDocId = null;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const statusRes = await fetch(`${endpoint}/reports/2021-06-30/reports/${reportId}`, {
      headers: { 'x-amz-access-token': token }
    });
    const statusData = await statusRes.json();
    console.log(`Poll ${i + 1}: Status = ${statusData.processingStatus}`);
    if (statusData.processingStatus === 'DONE') {
      reportDocId = statusData.reportDocumentId;
      break;
    }
    if (statusData.processingStatus === 'FATAL' || statusData.processingStatus === 'CANCELLED') {
      console.error('Report processing failed:', statusData);
      return;
    }
  }

  if (reportDocId) {
    console.log(`Fetching report document: ${reportDocId}...`);
    const docRes = await fetch(`${endpoint}/reports/2021-06-30/documents/${reportDocId}`, {
      headers: { 'x-amz-access-token': token }
    });
    const docData = await docRes.json();
    console.log('Document URL fetched. Downloading content...');

    const contentRes = await fetch(docData.url);
    const content = await contentRes.text();
    fs.writeFileSync('data/seller-central-inventory-report.tsv', content);
    console.log(`Report saved to data/seller-central-inventory-report.tsv (${content.length} bytes)`);

    // Parse and print summary
    const lines = content.split('\n');
    console.log(`Total rows in report: ${lines.length}`);
    const headers = lines[0].split('\t');
    console.log('Headers:', headers.slice(0, 10));
    lines.slice(1, 25).forEach((line, idx) => {
      if (!line.trim()) return;
      const cols = line.split('\t');
      console.log(`[${idx + 1}] SKU: ${cols[3]} | ASIN: ${cols[16] || cols[1]} | Status: ${cols[15] || 'Active'} | Qty: ${cols[5]} | Price: ₹${cols[4]} | Title: ${cols[0]?.substring(0, 45)}`);
    });
  }
}

getInventoryReport().catch(console.error);

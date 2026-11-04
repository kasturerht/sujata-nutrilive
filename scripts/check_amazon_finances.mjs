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

async function checkAmazonFinances() {
  const tokenRes = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.AMAZON_REFRESH_TOKEN,
      client_id: env.AMAZON_LWA_CLIENT_ID,
      client_secret: env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const tData = await tokenRes.json();
  if (!tData.access_token) {
    console.error('Amazon auth error:', tData);
    return;
  }
  const token = tData.access_token;

  // 1. Check Financial Event Groups (Settlement Cycles / Disbursements)
  const groupsUrl = 'https://sellingpartnerapi-eu.amazon.com/finances/v0/financialEventGroups?FinancialEventGroupStartedAfter=2026-09-30T18:30:00Z';
  console.log('Fetching Amazon Financial Event Groups...');
  const gRes = await fetch(groupsUrl, {
    headers: { 'x-amz-access-token': token }
  });
  const gData = await gRes.json();
  console.log('Event Groups:', JSON.stringify(gData, null, 2));

  // 2. Check Financial Events since Oct 1
  const eventsUrl = 'https://sellingpartnerapi-eu.amazon.com/finances/v0/financialEvents?PostedAfter=2026-09-30T18:30:00Z';
  console.log('Fetching Amazon Financial Events...');
  const eRes = await fetch(eventsUrl, {
    headers: { 'x-amz-access-token': token }
  });
  const eData = await eRes.json();
  fs.writeFileSync('scripts/amazon_finances_raw.json', JSON.stringify(eData, null, 2), 'utf8');

  const shipmentEvents = eData.payload?.FinancialEvents?.ShipmentEventList || [];
  console.log(`Total Shipment Events in October: ${shipmentEvents.length}`);

  let totalPrincipal = 0;
  let totalFees = 0;
  let totalTaxes = 0;
  let totalPromotions = 0;
  let feeBreakdown = {};

  shipmentEvents.forEach(se => {
    (se.ShipmentItemList || []).forEach(si => {
      // Principal
      (si.ItemChargeList || []).forEach(ic => {
        if (ic.ChargeType === 'Principal') {
          totalPrincipal += parseFloat(ic.ChargeAmount?.CurrencyAmount || '0');
        } else if (ic.ChargeType === 'Tax') {
          totalTaxes += parseFloat(ic.ChargeAmount?.CurrencyAmount || '0');
        }
      });
      // Fees
      (si.ItemFeeList || []).forEach(f => {
        const amt = parseFloat(f.FeeAmount?.CurrencyAmount || '0');
        totalFees += amt;
        feeBreakdown[f.FeeType] = (feeBreakdown[f.FeeType] || 0) + amt;
      });
      // Promotions
      (si.PromotionList || []).forEach(p => {
        totalPromotions += parseFloat(p.PromotionAmount?.CurrencyAmount || '0');
      });
    });
  });

  console.log('--- AMAZON FINANCIALS BREAKDOWN (OCTOBER 2026) ---');
  console.log(`Total Sales Principal (Customer Paid): ₹${totalPrincipal.toFixed(2)}`);
  console.log(`Total Amazon Fees (Commission, Closing, Shipping): ₹${totalFees.toFixed(2)}`);
  console.log(`Fee Types:`, feeBreakdown);
  console.log(`Net Amazon Payout: ₹${(totalPrincipal + totalFees).toFixed(2)}`);
}

checkAmazonFinances().catch(console.error);

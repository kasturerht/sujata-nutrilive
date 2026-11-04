import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/amazon_finances_raw.json', 'utf8'));
const fe = data.payload.FinancialEvents;

console.log('=== SERVICE FEES ===');
let totalServiceFees = 0;
(fe.ServiceFeeEventList || []).forEach(sf => {
  (sf.FeeList || []).forEach(f => {
    const amt = parseFloat(f.FeeAmount?.CurrencyAmount || 0);
    totalServiceFees += amt;
    console.log(`  - ${f.FeeType}: ₹${amt}`);
  });
});
console.log('Total Service Fees:', totalServiceFees);

console.log('\n=== ADJUSTMENTS ===');
let totalAdjustments = 0;
(fe.AdjustmentEventList || []).forEach(a => {
  const amt = parseFloat(a.AdjustmentAmount?.CurrencyAmount || 0);
  totalAdjustments += amt;
  console.log(`  - Adjustment Type: ${a.AdjustmentType} | Amount: ₹${amt}`);
});
console.log('Total Adjustments:', totalAdjustments);

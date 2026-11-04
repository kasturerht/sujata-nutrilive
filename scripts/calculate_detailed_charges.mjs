import fs from 'fs';

const orders = JSON.parse(fs.readFileSync('scripts/october_orders_raw.json', 'utf8'));

let overallOriginalPrice = 0; // Total MRP before any discounts
let overallDiscount = 0;      // Total discounts given
let overallNetRevenue = 0;    // What customer paid/will pay

let prepaidOriginal = 0;
let prepaidDiscount = 0;
let prepaidNet = 0;
let prepaidRzpFeeEst = 0;
let prepaidBankSettlementEst = 0;

let codOriginal = 0;
let codDiscount = 0;
let codNet = 0;

const tableRows = [];

// Sort chronological
orders.sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

for (const o of orders) {
  const num = o.order_number;
  const isPaid = o.financial_status === 'paid';
  const gateways = (o.payment_gateway_names || []).join(', ') || o.gateway || (isPaid ? 'Razorpay' : 'COD');
  
  // Calculate item original price
  let orderItemsOriginal = 0;
  for (const item of (o.line_items || [])) {
    // If compare_at_price or line item price
    const qty = item.quantity || 1;
    const price = parseFloat(item.price || '0');
    // Note: in shopify, item.price is unit price before order-level discounts, but might have item discount
    // Check if there are discount allocations
    let itemDiscounts = 0;
    (item.discount_allocations || []).forEach(da => {
      itemDiscounts += parseFloat(da.amount || '0');
    });
    orderItemsOriginal += (price * qty);
  }

  const orderDiscount = parseFloat(o.total_discounts || '0');
  const finalPrice = parseFloat(o.total_price || '0');

  // If item original price is less than final price + discount, adjust
  const grossBeforeDiscount = orderItemsOriginal > finalPrice ? orderItemsOriginal : (finalPrice + orderDiscount);

  overallOriginalPrice += grossBeforeDiscount;
  overallDiscount += orderDiscount;
  overallNetRevenue += finalPrice;

  // Razorpay standard MDR fee: 2% + 18% GST = 2.36%
  let rzpFee = 0;
  let bankSettlement = 0;

  if (isPaid) {
    prepaidOriginal += grossBeforeDiscount;
    prepaidDiscount += orderDiscount;
    prepaidNet += finalPrice;
    
    // Exact standard Razorpay formula:
    // Fee = 2% of transaction amount
    // GST = 18% of Fee
    // Total deduction = Fee + GST = 2.36%
    rzpFee = Math.round((finalPrice * 0.02 * 1.18) * 100) / 100;
    bankSettlement = Math.round((finalPrice - rzpFee) * 100) / 100;

    prepaidRzpFeeEst += rzpFee;
    prepaidBankSettlementEst += bankSettlement;
  } else {
    codOriginal += grossBeforeDiscount;
    codDiscount += orderDiscount;
    codNet += finalPrice;
    bankSettlement = finalPrice; // Collected in cash upon delivery
  }

  tableRows.push({
    num,
    customer: `${o.customer?.first_name || ''} ${o.customer?.last_name || ''}`.trim() || 'Guest',
    mode: isPaid ? 'Online (Razorpay)' : 'Cash on Delivery (COD)',
    gross: grossBeforeDiscount,
    discount: orderDiscount,
    finalPaid: finalPrice,
    rzpFee: isPaid ? rzpFee : 0,
    netToBank: isPaid ? bankSettlement : finalPrice
  });
}

console.log('=== OVERALL OCTOBER BREAKDOWN ===');
console.log(`1. Total Gross Order Value (मूल किंमत): ₹${overallOriginalPrice.toFixed(2)}`);
console.log(`2. Total Discounts Given (सूट वजा): -₹${overallDiscount.toFixed(2)}`);
console.log(`3. Total Customer Payable (ग्राहकाकडून येणे/आलेले): ₹${overallNetRevenue.toFixed(2)}`);
console.log(`\n--- PREPAID ORDERS (11 Online Orders via Razorpay) ---`);
console.log(`- Gross Value: ₹${prepaidOriginal.toFixed(2)}`);
console.log(`- Discounts Deducted: -₹${prepaidDiscount.toFixed(2)}`);
console.log(`- Total Paid by Customers to Razorpay: ₹${prepaidNet.toFixed(2)}`);
console.log(`- Razorpay Gateway Charges (2% + 18% GST = 2.36%): -₹${prepaidRzpFeeEst.toFixed(2)}`);
console.log(`- Actual Net Settled to Bank Account: ₹${prepaidBankSettlementEst.toFixed(2)}`);

console.log(`\n--- COD ORDERS (19 Cash on Delivery Orders) ---`);
console.log(`- Gross Value: ₹${codOriginal.toFixed(2)}`);
console.log(`- Discounts Deducted: -₹${codDiscount.toFixed(2)}`);
console.log(`- Total Cash to be Collected at Doorstep: ₹${codNet.toFixed(2)}`);
console.log(`- Razorpay Charges: ₹0.00 (COD वर Razorpay चार्जेस लागत नाहीत)`);

console.log(`\n--- ALL 30 ORDERS DETAILED SHEET ---`);
tableRows.forEach(r => {
  console.log(`#${r.num} | ${r.mode} | Gross: ₹${r.gross.toFixed(2)} | Disc: -₹${r.discount.toFixed(2)} | Final: ₹${r.finalPaid.toFixed(2)} | RZP Fee: -₹${r.rzpFee.toFixed(2)} | Bank Net: ₹${r.netToBank.toFixed(2)} (${r.customer})`);
});

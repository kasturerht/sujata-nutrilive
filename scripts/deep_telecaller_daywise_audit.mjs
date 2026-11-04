import fs from 'fs';

const leads = JSON.parse(fs.readFileSync('scripts/telecaller_leads_dump.json', 'utf8'));
const orders = JSON.parse(fs.readFileSync('scripts/telecaller_orders_dump.json', 'utf8'));
const meta = JSON.parse(fs.readFileSync('scripts/meta_telecaller_3day.json', 'utf8'));

// Telecaller mapping
const callers = {
  'BuHMGdqFxWO6WtWf1j2MUb3W3wO2': 'Monu',
  'Qj5em1x3JwheIqPKbLQzeoMiPRO2': 'Vaishnavi Diwate',
  'jdZdyrOfhXcsliQrRQTy0UeB78D3': 'Punam Kasture',
  'J5WsatITDjhPe6sMc42EqneEdhs1': 'Manjushree Kasture',
  'XfqaxFK5CJhGzx9jkmp4u9LZico2': 'Karishma Patil',
  'Sgi4NYPTc8WMGVVbCS0ip3h6Efp2': 'Abhishek Ahire',
  'Ph0R2GnettRxwNvi0QGKwU6LXej1': 'Yash Suryawanshi',
  'AeLzP5Kr0LhCFoatVAiYkgmeuP83': 'Rohit Kasture'
};

const targetDates = ['2026-10-27', '2026-10-28', '2026-10-29'];

function getDateIST(item) {
  let dateStr = null;
  if (item.createdAt) {
    if (typeof item.createdAt === 'string') dateStr = item.createdAt;
    else if (item.createdAt._seconds) dateStr = new Date(item.createdAt._seconds * 1000).toISOString();
  } else if (item.createdAtMillis) {
    dateStr = new Date(item.createdAtMillis).toISOString();
  } else if (item.events && item.events.length > 0) {
    for (const ev of item.events) {
      if (ev.timestamp) {
        dateStr = ev.timestamp;
        break;
      }
    }
  }
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
}

// 1. Process Leads
const leadsByDayAndCaller = {
  '2026-10-27': {},
  '2026-10-28': {},
  '2026-10-29': {}
};

for (const l of leads) {
  const d = getDateIST(l);
  if (targetDates.includes(d)) {
    const callerId = l.assignedTo || 'Unassigned';
    const callerName = callers[callerId] || l.assignedToName || callerId;
    if (!leadsByDayAndCaller[d][callerName]) leadsByDayAndCaller[d][callerName] = [];
    leadsByDayAndCaller[d][callerName].push(l);
  }
}

// 2. Process Orders
const ordersByDayAndCaller = {
  '2026-10-27': {},
  '2026-10-28': {},
  '2026-10-29': {}
};

for (const o of orders) {
  const d = getDateIST(o);
  if (targetDates.includes(d)) {
    const callerId = o.assignedTo || 'Unassigned';
    const callerName = callers[callerId] || callerId;
    if (!ordersByDayAndCaller[d][callerName]) ordersByDayAndCaller[d][callerName] = [];
    ordersByDayAndCaller[d][callerName].push(o);
  }
}

console.log('=== DETAILED 3-DAY TELECALLER AUDIT ===\n');

targetDates.forEach(date => {
  console.log(`\n================================================================`);
  console.log(`DATE: ${date}`);
  console.log(`================================================================`);

  const activeCallers = ['Monu', 'Vaishnavi Diwate', 'Punam Kasture', 'Manjushree Kasture', 'Karishma Patil'];

  activeCallers.forEach(name => {
    // Meta stats
    const m = meta[name]?.[date] || { spend: 0, clicks: 0, linkClicks: 0, leads: 0, messagingConversations: 0 };
    
    // Nexa Leads App stats
    const appLeads = leadsByDayAndCaller[date][name] || [];
    
    // Nexa Orders stats
    const appOrders = ordersByDayAndCaller[date][name] || [];

    console.log(`\n👤 TELECALLER: ${name}`);
    console.log(`   📱 Meta Ads:`);
    console.log(`      - Spend: ₹${m.spend.toFixed(2)}`);
    console.log(`      - Link Clicks: ${m.linkClicks}`);
    console.log(`      - WhatsApp Messages/Leads (Meta): ${m.messagingConversations} (Leads: ${m.leads})`);
    console.log(`   📋 Nexa Leads App:`);
    console.log(`      - App Entries (Leads Fed): ${appLeads.length}`);
    console.log(`   🛒 Converted Orders (Number of confirmed orders): ${appOrders.length}`);
    if (appOrders.length > 0) {
      appOrders.forEach(o => {
        console.log(`         • Order ID: ${o.id} | Status: ${o.status} | Product: ${o.product} | Amt: ₹${o.orderAmount || o.orderAmountNum}`);
      });
    }
  });

  // Check if any other callers had entries on this day
  const otherLeadCallers = Object.keys(leadsByDayAndCaller[date]).filter(c => !activeCallers.includes(c));
  if (otherLeadCallers.length > 0) {
    console.log(`\n   ℹ️ Other/Unassigned Leads:`);
    otherLeadCallers.forEach(c => {
      console.log(`      - ${c}: ${leadsByDayAndCaller[date][c].length} leads`);
    });
  }

  const otherOrderCallers = Object.keys(ordersByDayAndCaller[date]).filter(c => !activeCallers.includes(c));
  if (otherOrderCallers.length > 0) {
    console.log(`\n   ℹ️ Other/Unassigned Orders:`);
    otherOrderCallers.forEach(c => {
      console.log(`      - ${c}: ${ordersByDayAndCaller[date][c].length} orders`);
    });
  }
});

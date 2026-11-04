import fs from 'fs';

const leads = JSON.parse(fs.readFileSync('scripts/telecaller_leads_dump.json', 'utf8'));
const orders = JSON.parse(fs.readFileSync('scripts/telecaller_orders_dump.json', 'utf8'));
const meta = JSON.parse(fs.readFileSync('scripts/meta_telecaller_3day.json', 'utf8'));

// Telecaller mapping
const telecallers = [
  {
    name: 'Monu',
    phone: '95034 34653',
    metaKey: 'Monu',
    firebaseUserId: 'BuHMGdqFxWO6WtWf1j2MUb3W3wO2'
  },
  {
    name: 'Vaishnavi Diwate',
    phone: '99225 34443',
    metaKey: 'Vaishnavi Diwate',
    firebaseUserId: 'Qj5em1x3JwheIqPKbLQzeoMiPRO2'
  },
  {
    name: 'Punam Kasture',
    phone: '99225 00344',
    metaKey: 'Punam Kasture (Shirsath)',
    firebaseUserId: 'jdZdyrOfhXcsliQrRQTy0UeB78D3'
  },
  {
    name: 'Manjushree Kasture',
    phone: '92724 71529',
    metaKey: 'Manjushree Kasture',
    firebaseUserId: 'J5WsatITDjhPe6sMc42EqneEdhs1'
  },
  {
    name: 'Karishma Patil',
    phone: '99225 77344',
    metaKey: 'Karishma Patil',
    firebaseUserId: 'XfqaxFK5CJhGzx9jkmp4u9LZico2'
  }
];

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
  return new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

// Map leads
const leadsMap = {};
for (const l of leads) {
  const d = getDateIST(l);
  if (targetDates.includes(d)) {
    const uId = l.assignedTo;
    if (!leadsMap[d]) leadsMap[d] = {};
    if (!leadsMap[d][uId]) leadsMap[d][uId] = [];
    leadsMap[d][uId].push(l);
  }
}

// Map orders
const ordersMap = {};
for (const o of orders) {
  const d = getDateIST(o);
  if (targetDates.includes(d)) {
    const uId = o.assignedTo;
    if (!ordersMap[d]) ordersMap[d] = {};
    if (!ordersMap[d][uId]) ordersMap[d][uId] = [];
    ordersMap[d][uId].push(o);
  }
}

console.log('=== VERIFIED EXACT 3-DAY DATA ===\n');

targetDates.forEach(date => {
  console.log(`\n========================================`);
  console.log(`DATE: ${date}`);
  console.log(`========================================`);
  
  let dayTotalMetaLeads = 0;
  let dayTotalAppLeads = 0;
  let dayTotalOrders = 0;
  let dayTotalSpend = 0;

  telecallers.forEach(t => {
    const m = meta[t.metaKey]?.[date] || { spend: 0, clicks: 0, linkClicks: 0, messagingConversations: 0, leads: 0 };
    const appL = (leadsMap[date]?.[t.firebaseUserId] || []).length;
    const appO = (ordersMap[date]?.[t.firebaseUserId] || []).length;

    dayTotalMetaLeads += m.messagingConversations;
    dayTotalAppLeads += appL;
    dayTotalOrders += appO;
    dayTotalSpend += m.spend;

    console.log(`[${t.name} - ${t.phone}]`);
    console.log(`  Meta Ads: Spend ₹${m.spend.toFixed(2)} | WhatsApp Leads: ${m.messagingConversations} | Link Clicks: ${m.linkClicks}`);
    console.log(`  App Entries (Leads Fed): ${appL}`);
    console.log(`  Confirmed Orders: ${appO}`);
  });

  console.log(`\n--- DAY TOTAL (${date}) ---`);
  console.log(`Total Meta Spend: ₹${dayTotalSpend.toFixed(2)}`);
  console.log(`Total Meta WhatsApp Leads: ${dayTotalMetaLeads}`);
  console.log(`Total App Entries: ${dayTotalAppLeads}`);
  console.log(`Total Confirmed Orders: ${dayTotalOrders}`);
});

console.log('\n========================================');
console.log('=== 3-DAY COMBINED CONSOLIDATED SUMMARY ===');
console.log('========================================');

telecallers.forEach(t => {
  let tMetaLeads = 0;
  let tAppLeads = 0;
  let tOrders = 0;
  let tSpend = 0;

  targetDates.forEach(d => {
    const m = meta[t.metaKey]?.[d] || { spend: 0, messagingConversations: 0 };
    tMetaLeads += m.messagingConversations;
    tSpend += m.spend;
    tAppLeads += (leadsMap[d]?.[t.firebaseUserId] || []).length;
    tOrders += (ordersMap[d]?.[t.firebaseUserId] || []).length;
  });

  console.log(`${t.name} (${t.phone}):`);
  console.log(`  - 3-Day Meta Spend: ₹${tSpend.toFixed(2)}`);
  console.log(`  - 3-Day Meta WhatsApp Leads: ${tMetaLeads}`);
  console.log(`  - 3-Day App Entries: ${tAppLeads}`);
  console.log(`  - 3-Day Confirmed Orders: ${tOrders}`);
});

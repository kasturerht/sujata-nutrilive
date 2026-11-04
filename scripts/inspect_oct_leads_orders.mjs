import fs from 'fs';

const leads = JSON.parse(fs.readFileSync('scripts/telecaller_leads_dump.json', 'utf8'));
const orders = JSON.parse(fs.readFileSync('scripts/telecaller_orders_dump.json', 'utf8'));

console.log('Total leads:', leads.length);
console.log('Total orders:', orders.length);

// Let's find all leads with any timestamp in October 2026
const octLeads = [];
for (const l of leads) {
  let dateStr = null;
  if (l.createdAt) {
    if (typeof l.createdAt === 'string') dateStr = l.createdAt;
    else if (l.createdAt._seconds) dateStr = new Date(l.createdAt._seconds * 1000).toISOString();
  } else if (l.createdAtMillis) {
    dateStr = new Date(l.createdAtMillis).toISOString();
  } else if (l.events && l.events.length > 0) {
    // Check events
    for (const ev of l.events) {
      if (ev.timestamp) {
        dateStr = ev.timestamp;
        break;
      }
    }
  }

  if (dateStr && dateStr.startsWith('2026-10')) {
    octLeads.push({
      id: l.id,
      name: l.name,
      phone: l.phone,
      assignedTo: l.assignedTo,
      assignedToName: l.assignedToName,
      status: l.status,
      dateStr,
      dateIST: new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) // YYYY-MM-DD
    });
  }
}

console.log('Leads with October 2026 date:', octLeads.length);

// Let's check dates of octLeads
const leadDateCounts = {};
octLeads.forEach(l => {
  leadDateCounts[l.dateIST] = (leadDateCounts[l.dateIST] || 0) + 1;
});
console.log('Lead Counts by Date IST:', leadDateCounts);

// Now let's do the same for orders
const octOrders = [];
for (const o of orders) {
  let dateStr = null;
  if (o.createdAt) {
    if (typeof o.createdAt === 'string') dateStr = o.createdAt;
    else if (o.createdAt._seconds) dateStr = new Date(o.createdAt._seconds * 1000).toISOString();
  } else if (o.createdAtMillis) {
    dateStr = new Date(o.createdAtMillis).toISOString();
  }

  if (dateStr && dateStr.startsWith('2026-10')) {
    octOrders.push({
      id: o.id,
      assignedTo: o.assignedTo,
      customerPhone: o.customerPhone,
      product: o.product,
      orderAmount: o.orderAmount,
      status: o.status,
      dateStr,
      dateIST: new Date(dateStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) // YYYY-MM-DD
    });
  }
}

console.log('\nOrders with October 2026 date:', octOrders.length);
const orderDateCounts = {};
octOrders.forEach(o => {
  orderDateCounts[o.dateIST] = (orderDateCounts[o.dateIST] || 0) + 1;
});
console.log('Order Counts by Date IST:', orderDateCounts);

// scripts/detailed_yesterday_interactions.mjs
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const orgRef = db.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');

async function run() {
  const startIso = '2026-10-26T00:00:00';
  const endIso = '2026-10-26T23:59:59.999Z';

  const snap = await orgRef.collection('interactions')
    .where('timestamp', '>=', startIso)
    .where('timestamp', '<=', endIso)
    .get();

  console.log(`Total Interactions logged yesterday in NexaLeads: ${snap.size}`);

  const callerBreakdown = {};

  snap.forEach(d => {
    const data = d.data();
    const caller = data.callerName || data.callerId || 'Unknown';
    if (!callerBreakdown[caller]) {
      callerBreakdown[caller] = {
        totalCalls: 0,
        statusAfterCounts: {},
        leadIds: new Set()
      };
    }
    callerBreakdown[caller].totalCalls++;
    const status = data.statusAfter || 'NoStatus';
    callerBreakdown[caller].statusAfterCounts[status] = (callerBreakdown[caller].statusAfterCounts[status] || 0) + 1;
    callerBreakdown[caller].leadIds.add(data.leadId);
  });

  console.log('\n--- CALLER ACTIONS BREAKDOWN YESTERDAY IN NEXALEADS ---');
  for (const [caller, stats] of Object.entries(callerBreakdown)) {
    console.log(`\n📞 ${caller}:`);
    console.log(`  Total Calls/Interactions Logged: ${stats.totalCalls}`);
    console.log(`  Unique Leads Handled: ${stats.leadIds.size}`);
    console.log(`  Outcomes (statusAfter):`, stats.statusAfterCounts);
  }

  // Also check orders placed yesterday
  const ordersSnap = await orgRef.collection('orders_data')
    .where('createdAt', '>=', startIso)
    .where('createdAt', '<=', endIso)
    .get();

  console.log(`\n🛒 Total Orders Logged Yesterday in NexaLeads: ${ordersSnap.size}`);
  ordersSnap.forEach(o => {
    const od = o.data();
    console.log(`Order ${o.id}: By ${od.telecallerName || od.callerName || 'Unknown'} - Amount: ₹${od.orderAmount || od.totalAmount || 0} (Customer: ${od.customerName || od.phone})`);
  });
}

run().then(() => process.exit(0)).catch(console.error);

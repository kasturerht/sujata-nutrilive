import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const orgId = 'ORG_SUJATA_NUTRILIVE_8117';
const orgRef = db.collection('organizations').doc(orgId);

async function checkTelecallers() {
  console.log("=== CHECKING TELECALLER ORDERS & LEADS IN FIREBASE (NOV 1 - NOV 3) ===");
  const leadsSnapshot = await orgRef.collection('leads')
    .where('createdAt', '>=', new Date('2026-11-01T00:00:00Z'))
    .get();

  console.log(`Total Leads created since Nov 1: ${leadsSnapshot.size}`);

  const dayMap = {};
  leadsSnapshot.forEach(doc => {
    const data = doc.data();
    const createdDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    const dateStr = createdDate.toISOString().slice(0, 10);
    if (!dayMap[dateStr]) {
      dayMap[dateStr] = { leads: 0, converted: 0, callers: {} };
    }
    dayMap[dateStr].leads++;
    const caller = data.assignedToName || data.assignedTo || 'Unassigned';
    if (!dayMap[dateStr].callers[caller]) {
      dayMap[dateStr].callers[caller] = { leads: 0, converted: 0 };
    }
    dayMap[dateStr].callers[caller].leads++;

    if (data.status === 'CONVERTED' || data.status === 'WON' || data.isConverted || data.orderPlaced) {
      dayMap[dateStr].converted++;
      dayMap[dateStr].callers[caller].converted++;
    }
  });

  console.log("Daywise breakdown:", JSON.stringify(dayMap, null, 2));

  // Also check orders collection directly in Firebase if exists
  const ordersColl = await orgRef.collection('orders').where('createdAt', '>=', new Date('2026-11-01T00:00:00Z')).get();
  console.log(`Direct Firebase Orders collection count since Nov 1: ${ordersColl.size}`);
  ordersColl.forEach(doc => {
    const o = doc.data();
    console.log(`Firebase Order: ${doc.id} | Amount: ₹${o.totalAmount || o.amount} | Status: ${o.status} | Created: ${o.createdAt?.toDate?.() || o.createdAt}`);
  });
}

checkTelecallers().catch(console.error);

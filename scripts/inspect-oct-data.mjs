import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const orgRef = db.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');

async function octAnalysis() {
  const usersSnap = await orgRef.collection('users').get();
  const users = {};
  usersSnap.forEach(d => {
    users[d.id] = { id: d.id, ...d.data() };
  });

  const interactionsSnap = await orgRef.collection('interactions').get();
  const ordersSnap = await orgRef.collection('orders_data').get();
  const leadsSnap = await orgRef.collection('leads').get();

  const octInteractions = [];
  interactionsSnap.forEach(d => {
    const data = d.data();
    if (data.timestamp && data.timestamp.startsWith('2026-10')) {
      octInteractions.push(data);
    }
  });

  const octOrders = [];
  ordersSnap.forEach(d => {
    const data = d.data();
    if (data.createdAt && typeof data.createdAt === 'string' && data.createdAt.startsWith('2026-10')) {
      octOrders.push(data);
    }
  });

  console.log(`October 2026: ${octInteractions.length} interactions, ${octOrders.length} orders.`);

  // October orders by caller
  const octOrdersByCaller = {};
  let octRevenue = 0;
  octOrders.forEach(o => {
    const cId = o.assignedTo || 'unknown';
    const cName = users[cId] ? users[cId].name : cId;
    if (!octOrdersByCaller[cName]) {
      octOrdersByCaller[cName] = { count: 0, revenue: 0 };
    }
    octOrdersByCaller[cName].count++;
    const amt = Number(o.orderAmountNum || o.orderAmount || 0);
    octOrdersByCaller[cName].revenue += isNaN(amt) ? 0 : amt;
    octRevenue += isNaN(amt) ? 0 : amt;
  });

  console.log('October 2026 Orders by Caller:', octOrdersByCaller);
  console.log(`Total October Revenue: ₹${octRevenue}`);

  // October interactions by caller
  const octInteractionsByCaller = {};
  octInteractions.forEach(i => {
    const cName = i.callerName || (users[i.callerId] ? users[i.callerId].name : 'Unknown');
    octInteractionsByCaller[cName] = (octInteractionsByCaller[cName] || 0) + 1;
  });
  console.log('October 2026 Interactions by Caller:', octInteractionsByCaller);
}

octAnalysis().then(() => process.exit(0)).catch(console.error);

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const orgRef = db.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');

// Filter: 1st Oct 2026 00:00:00 IST to 25th Oct 2026 23:59:59.999 IST
// IST is UTC + 5:30
const START_TIME_MS = new Date('2026-10-01T00:00:00+05:30').getTime();
const END_TIME_MS = new Date('2026-10-25T23:59:59.999+05:30').getTime();

const TARGET_CALLERS = [
  'Monu',
  'Punam Shirsath',
  'Darshan Bayas',
  'Manjushree Kasture',
  'Arjunsing Suryawanshi',
  'Vaishnavi Divate',
  'Karishma Patil'
];

function normalizeCaller(name) {
  if (!name) return null;
  name = name.trim();
  for (const t of TARGET_CALLERS) {
    if (t.toLowerCase() === name.toLowerCase()) return t;
  }
  // Alternate checks: Darshan Bayas vs Monu
  if (name.toLowerCase().includes('darshan') && !name.toLowerCase().includes('monu')) return 'Darshan Bayas';
  if (name.toLowerCase().includes('monu')) return 'Monu';
  if (name.toLowerCase().includes('punam')) return 'Punam Shirsath';
  if (name.toLowerCase().includes('manjushree')) return 'Manjushree Kasture';
  if (name.toLowerCase().includes('arjunsing')) return 'Arjunsing Suryawanshi';
  if (name.toLowerCase().includes('vaishnavi')) return 'Vaishnavi Divate';
  if (name.toLowerCase().includes('karishma')) return 'Karishma Patil';
  return null;
}

function parseDateMs(val) {
  if (!val) return null;
  if (typeof val === 'number') return val;
  if (val._seconds) return val._seconds * 1000;
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  return null;
}

async function analyzeOct1to25() {
  const usersSnap = await orgRef.collection('users').get();
  const users = {};
  usersSnap.forEach(d => {
    users[d.id] = { id: d.id, ...d.data() };
  });

  const leadsSnap = await orgRef.collection('leads').get();
  const interactionsSnap = await orgRef.collection('interactions').get();
  const ordersSnap = await orgRef.collection('orders_data').get();

  // Initialize stats for the 7 target callers
  const stats = {};
  TARGET_CALLERS.forEach(name => {
    stats[name] = {
      name,
      leadsAssignedInPeriod: 0,
      totalLeadsActiveInOct: 0,
      interactionsInPeriod: 0,
      leadsWithNotesInOct: 0,
      leadsWithoutNotesInOct: 0,
      ordersConfirmedInPeriod: 0,
      revenueInPeriod: 0,
      statusCountsInPeriod: {},
      subStatusCountsInPeriod: {},
      callNotAnsweredCount: 0,
      orderItemsList: []
    };
  });

  // 1. Analyze Interactions in Oct 1-25
  const leadInteractionsInOct = new Map();
  interactionsSnap.forEach(d => {
    const data = d.data();
    const tMs = parseDateMs(data.timestamp) || parseDateMs(data.serverCreatedAt);
    if (tMs && tMs >= START_TIME_MS && tMs <= END_TIME_MS) {
      let cName = normalizeCaller(data.callerName);
      if (!cName && data.callerId && users[data.callerId]) {
        cName = normalizeCaller(users[data.callerId].name);
      }
      if (cName && stats[cName]) {
        stats[cName].interactionsInPeriod++;
        if (data.leadId) {
          if (!leadInteractionsInOct.has(data.leadId)) {
            leadInteractionsInOct.set(data.leadId, []);
          }
          leadInteractionsInOct.get(data.leadId).push({ ...data, caller: cName });
        }
      }
    }
  });

  // 2. Analyze Orders in Oct 1-25
  ordersSnap.forEach(d => {
    const data = d.data();
    const tMs = parseDateMs(data.createdAtMillis) || parseDateMs(data.createdAt);
    if (tMs && tMs >= START_TIME_MS && tMs <= END_TIME_MS) {
      let cName = null;
      if (data.assignedTo && users[data.assignedTo]) {
        cName = normalizeCaller(users[data.assignedTo].name);
      }
      if (!cName && data.customerId && leadInteractionsInOct.has(data.customerId)) {
        cName = leadInteractionsInOct.get(data.customerId)[0].caller;
      }
      if (cName && stats[cName]) {
        stats[cName].ordersConfirmedInPeriod++;
        const amt = Number(data.orderAmountNum || data.orderAmount || 0);
        stats[cName].revenueInPeriod += isNaN(amt) ? 0 : amt;
        stats[cName].orderItemsList.push({
          id: data.id,
          product: data.product,
          amount: amt,
          paymentMethod: data.paymentMethod,
          date: new Date(tMs).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        });
      }
    }
  });

  // 3. Analyze Leads in Oct 1-25
  // Check when leads were created or updated in this window
  leadsSnap.forEach(doc => {
    const l = doc.data();
    let cName = normalizeCaller(l.assignedToName);
    if (!cName && l.assignedTo && users[l.assignedTo]) {
      cName = normalizeCaller(users[l.assignedTo].name);
    }
    if (!cName) return;
    if (!stats[cName]) return;

    const createdMs = parseDateMs(l.createdAt);
    const updatedMs = parseDateMs(l.updatedAt);
    const hasOctInteraction = leadInteractionsInOct.has(doc.id);

    // If lead was created in period
    if (createdMs && createdMs >= START_TIME_MS && createdMs <= END_TIME_MS) {
      stats[cName].leadsAssignedInPeriod++;
    }

    // If lead was actively worked on in Oct (interaction in period OR updated in period)
    if (hasOctInteraction || (updatedMs && updatedMs >= START_TIME_MS && updatedMs <= END_TIME_MS)) {
      stats[cName].totalLeadsActiveInOct++;
      
      const st = (l.status || 'Unknown').trim();
      stats[cName].statusCountsInPeriod[st] = (stats[cName].statusCountsInPeriod[st] || 0) + 1;

      if (st === 'Call Not Answered') {
        stats[cName].callNotAnsweredCount++;
      }

      if (l.notes && l.notes.trim() !== '') {
        stats[cName].leadsWithNotesInOct++;
      } else {
        stats[cName].leadsWithoutNotesInOct++;
      }
    }
  });

  // Print results
  console.log('\n================ OCTOBER 1 - 25, 2026 AUDIT ================');
  const summary = TARGET_CALLERS.map(name => {
    const s = stats[name];
    // If leadsAssignedInPeriod is 0, let's see active leads in Oct
    const baseCount = s.leadsAssignedInPeriod > 0 ? s.leadsAssignedInPeriod : s.totalLeadsActiveInOct;
    const convRate = baseCount > 0 ? ((s.ordersConfirmedInPeriod / baseCount) * 100).toFixed(1) + '%' : (s.interactionsInPeriod > 0 ? ((s.ordersConfirmedInPeriod / s.interactionsInPeriod) * 100).toFixed(1) + '%' : '0%');
    const noteFeedRate = s.totalLeadsActiveInOct > 0 ? ((s.leadsWithNotesInOct / s.totalLeadsActiveInOct) * 100).toFixed(1) + '%' : '0%';

    return {
      'Telecaller': name,
      'New Leads Assigned': s.leadsAssignedInPeriod,
      'Active Leads Worked': s.totalLeadsActiveInOct,
      'Calls / Interactions': s.interactionsInPeriod,
      'Notes Fed in App': s.leadsWithNotesInOct,
      'No Notes (Missed)': s.leadsWithoutNotesInOct,
      'Note Feed %': noteFeedRate,
      'Not Answered': s.callNotAnsweredCount,
      'Orders Confirmed': s.ordersConfirmedInPeriod,
      'Conversion Rate %': convRate,
      'Sales Revenue (₹)': s.revenueInPeriod
    };
  });

  console.table(summary);
  fs.writeFileSync('scripts/oct_1_to_25_audit.json', JSON.stringify({ summary, stats }, null, 2));
}

analyzeOct1to25().then(() => process.exit(0)).catch(console.error);

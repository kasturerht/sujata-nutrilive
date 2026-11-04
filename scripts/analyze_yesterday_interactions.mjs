// scripts/analyze_yesterday_interactions.mjs
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// If already initialized
let app;
try {
  app = initializeApp({ credential: cert(serviceAccount) });
} catch (e) {
  app = getFirestore();
}
const db = getFirestore(app);
const orgRef = db.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');

async function run() {
  const startIso = '2026-10-26T00:00:00';
  const endIso = '2026-10-26T23:59:59.999Z';

  const snap = await orgRef.collection('interactions')
    .where('timestamp', '>=', startIso)
    .where('timestamp', '<=', endIso)
    .get();

  console.log(`\n--- YESTERDAY INTERACTIONS ANALYSIS (Total: ${snap.size}) ---`);

  const userActionCounts = {};
  const leadsInvolved = new Set();
  const interactionsList = [];

  snap.forEach(doc => {
    const data = doc.data();
    interactionsList.push(data);
    const userId = data.userId || data.telecallerId || data.assignedTo || 'NoUserId';
    const status = data.status || data.action || 'UnknownStatus';
    leadsInvolved.add(data.leadId);

    if (!userActionCounts[userId]) {
      userActionCounts[userId] = { total: 0, statuses: {} };
    }
    userActionCounts[userId].total++;
    userActionCounts[userId].statuses[status] = (userActionCounts[userId].statuses[status] || 0) + 1;
  });

  console.log('Interactions by User ID:');
  console.log(JSON.stringify(userActionCounts, null, 2));

  // Map user IDs to telecaller names from users collection
  const usersSnap = await orgRef.collection('users').get();
  const usersMap = {};
  usersSnap.forEach(u => {
    usersMap[u.id] = u.data().name || u.data().email || u.id;
  });

  console.log('\n--- TELECALLER NAMES MAPPING ---');
  Object.keys(userActionCounts).forEach(uid => {
    console.log(`${usersMap[uid] || uid}: ${userActionCounts[uid].total} calls/actions`);
    console.log(`  Breakdown:`, userActionCounts[uid].statuses);
  });

  // Now check how many NEW leads were created / added in NexaLeads yesterday
  console.log(`\n--- CHECKING LEADS WITH UPDATED_AT YESTERDAY ---`);
  const leadsSnap = await orgRef.collection('leads')
    .where('updatedAt', '>=', startIso)
    .where('updatedAt', '<=', endIso)
    .get();

  console.log(`Total leads updated/created in NexaLeads yesterday: ${leadsSnap.size}`);

  const leadsByTelecaller = {};
  leadsSnap.forEach(l => {
    const d = l.data();
    const assigned = d.assignedToName || usersMap[d.assignedTo] || d.assignedTo || 'Unassigned';
    leadsByTelecaller[assigned] = (leadsByTelecaller[assigned] || 0) + 1;
  });

  console.log('Leads updated yesterday by telecaller:');
  console.log(JSON.stringify(leadsByTelecaller, null, 2));
}

run().then(() => process.exit(0)).catch(console.error);

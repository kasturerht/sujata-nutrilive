// scripts/query_yesterday_firebase.mjs
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const orgRef = db.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');

async function run() {
  try {
    console.log('📡 Testing Firestore connection for yesterday (2026-10-26)...');

    // 1. Query interactions from yesterday: timestamp starting with 2026-10-26
    const startIso = '2026-10-26T00:00:00';
    const endIso = '2026-10-26T23:59:59.999Z';

    const snap = await orgRef.collection('interactions')
      .where('timestamp', '>=', startIso)
      .where('timestamp', '<=', endIso)
      .get();

    console.log(`Found ${snap.size} interactions for 2026-10-26.`);

    const byTelecaller = {};
    const sampleInteractions = [];

    snap.forEach(doc => {
      const data = doc.data();
      const tc = data.telecallerName || data.telecallerId || 'Unknown';
      byTelecaller[tc] = (byTelecaller[tc] || 0) + 1;
      if (sampleInteractions.length < 5) {
        sampleInteractions.push(data);
      }
    });

    console.log('Interactions by Telecaller yesterday:', byTelecaller);

    // 2. Also check leads created yesterday
    // Let's check a sample lead to see its date field
    const sampleLeads = await orgRef.collection('leads').limit(5).get();
    sampleLeads.forEach(d => {
      console.log('Sample lead fields:', Object.keys(d.data()));
      console.log('Sample lead date values:', {
        createdAt: d.data().createdAt,
        timestamp: d.data().timestamp,
        date: d.data().date
      });
    });

  } catch (err) {
    console.error('❌ Error querying Firestore:', err);
  }
}

run().then(() => process.exit(0));

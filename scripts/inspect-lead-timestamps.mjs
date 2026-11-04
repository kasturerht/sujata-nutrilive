import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const orgRef = db.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');

async function inspectLeadFields() {
  const leadsSnap = await orgRef.collection('leads').limit(50).get();
  const timestampFields = new Set();
  leadsSnap.forEach(d => {
    const data = d.data();
    for (const [k, v] of Object.entries(data)) {
      if (k.toLowerCase().includes('date') || k.toLowerCase().includes('time') || k.toLowerCase().includes('created') || k.toLowerCase().includes('at')) {
        timestampFields.add(k);
      }
    }
  });
  console.log('Timestamp-like fields in leads:', Array.from(timestampFields));

  // Check how many leads have each of these fields
  const allLeads = await orgRef.collection('leads').get();
  const fieldCounts = {};
  timestampFields.forEach(f => fieldCounts[f] = 0);

  allLeads.forEach(d => {
    const data = d.data();
    timestampFields.forEach(f => {
      if (data[f] !== undefined && data[f] !== null && data[f] !== '') {
        fieldCounts[f]++;
      }
    });
  });

  console.log('Field populate counts out of 3171 leads:', fieldCounts);
}

inspectLeadFields().then(() => process.exit(0)).catch(console.error);

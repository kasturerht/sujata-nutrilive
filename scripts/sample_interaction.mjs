// scripts/sample_interaction.mjs
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
    .limit(3)
    .get();

  snap.forEach(d => {
    console.log(`Doc ID: ${d.id}`);
    console.log(JSON.stringify(d.data(), null, 2));
  });
}

run().then(() => process.exit(0)).catch(console.error);

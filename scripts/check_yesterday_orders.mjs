// scripts/check_yesterday_orders.mjs
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

  const ordersSnap = await orgRef.collection('orders_data')
    .where('createdAt', '>=', startIso)
    .where('createdAt', '<=', endIso)
    .get();

  ordersSnap.forEach(o => {
    console.log('\n--- ORDER DOC ---');
    console.log(JSON.stringify(o.data(), null, 2));
  });
}

run().then(() => process.exit(0)).catch(console.error);

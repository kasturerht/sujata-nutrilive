import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const orgRef = db.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');

async function dateAnalysis() {
  const interactionsSnap = await orgRef.collection('interactions').get();
  const months = {};
  
  interactionsSnap.forEach(d => {
    const data = d.data();
    if (data.timestamp) {
      const month = data.timestamp.slice(0, 7); // YYYY-MM
      months[month] = (months[month] || 0) + 1;
    }
  });

  console.log('Interactions by Month:', months);

  const ordersSnap = await orgRef.collection('orders_data').get();
  const orderMonths = {};
  ordersSnap.forEach(d => {
    const data = d.data();
    if (data.createdAt) {
      const month = typeof data.createdAt === 'string' ? data.createdAt.slice(0, 7) : 'other';
      orderMonths[month] = (orderMonths[month] || 0) + 1;
    }
  });
  console.log('Orders by Month:', orderMonths);
}

dateAnalysis().then(() => process.exit(0)).catch(console.error);

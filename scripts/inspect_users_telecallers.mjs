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

async function inspectUsers() {
  const usersSnap = await orgRef.collection('users').get();
  console.log('=== NEXA LEADS USERS ===');
  usersSnap.forEach(doc => {
    console.log(`User ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}

inspectUsers().catch(console.error);

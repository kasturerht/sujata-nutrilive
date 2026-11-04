import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
});

const firestore = getFirestore(app);

async function inspectFirestore() {
  console.log('=== INSPECTING FIRESTORE COLLECTIONS ===');
  try {
    const collections = await firestore.listCollections();
    console.log(`Found ${collections.length} root collections.`);
    
    for (const col of collections) {
      console.log(`\n========================================`);
      console.log(`Collection: [${col.id}]`);
      const countSnapshot = await col.count().get();
      const count = countSnapshot.data().count;
      console.log(`Total Document Count in [${col.id}]: ${count}`);
      
      const snapshot = await col.limit(5).get();
      let i = 0;
      for (const doc of snapshot.docs) {
        i++;
        console.log(`\n  --- Sample Doc ${i} (ID: ${doc.id}) ---`);
        const data = doc.data();
        console.log(`  Keys:`, Object.keys(data));
        console.log(`  Data:`, JSON.stringify(data, null, 2));
      }
    }
  } catch (err) {
    console.error('Error inspecting Firestore:', err);
  }
}

async function inspectRealtimeDB() {
  console.log('\n=== CHECKING REALTIME DATABASE ===');
  try {
    const db = getDatabase(app);
    const ref = db.ref('/');
    const snapshot = await ref.once('value');
    const val = snapshot.val();
    if (val) {
      console.log('Realtime DB root keys:', Object.keys(val));
    } else {
      console.log('Realtime DB is empty or null.');
    }
  } catch (err) {
    console.log('Realtime DB note:', err.message);
  }
}

async function run() {
  await inspectFirestore();
  await inspectRealtimeDB();
  process.exit(0);
}

run().catch(console.error);

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const firestore = getFirestore(app);

async function inspectOrgSubcollections() {
  const orgRef = firestore.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');
  const subcols = await orgRef.listCollections();
  console.log(`Subcollections inside ORG_SUJATA_NUTRILIVE_8117: ${subcols.map(s => s.id).join(', ')}`);

  for (const subcol of subcols) {
    console.log(`\n========================================`);
    console.log(`Subcollection: [${subcol.id}]`);
    const countSnapshot = await subcol.count().get();
    const count = countSnapshot.data().count;
    console.log(`Total Document Count in [${subcol.id}]: ${count}`);

    const snapshot = await subcol.limit(5).get();
    let i = 0;
    for (const doc of snapshot.docs) {
      i++;
      console.log(`\n  --- Sample Doc ${i} (ID: ${doc.id}) ---`);
      const data = doc.data();
      console.log(`  Keys:`, Object.keys(data));
      console.log(`  Data:`, JSON.stringify(data, null, 2));

      // check if this doc has further subcollections!
      const deeperCols = await doc.ref.listCollections();
      if (deeperCols.length > 0) {
        console.log(`    Deeper Subcollections: ${deeperCols.map(d => d.id).join(', ')}`);
      }
    }
  }

  // Also check other org ORG_D_C_ENTERPRISES_6865 just in case
  const orgRef2 = firestore.collection('organizations').doc('ORG_D_C_ENTERPRISES_6865');
  const subcols2 = await orgRef2.listCollections();
  console.log(`\nSubcollections inside ORG_D_C_ENTERPRISES_6865: ${subcols2.map(s => s.id).join(', ')}`);

  // Also check if there's any other org or user subcollections
  const usersSnap = await firestore.collection('user_mappings').limit(3).get();
  for (const uDoc of usersSnap.docs) {
    const uSub = await uDoc.ref.listCollections();
    if (uSub.length > 0) {
      console.log(`User ${uDoc.id} subcollections: ${uSub.map(s => s.id).join(', ')}`);
    }
  }
}

inspectOrgSubcollections().then(() => process.exit(0)).catch(console.error);

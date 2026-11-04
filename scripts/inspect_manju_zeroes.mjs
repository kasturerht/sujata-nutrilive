import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
const manju = data['Manjushree Kasture'];

const checkIndices = [9, 23, 51, 64, 87, 119];
for (const idx of checkIndices) {
  console.log(`=== MANJU MSG ${idx} ===`);
  console.log(manju[idx - 1].text);
}

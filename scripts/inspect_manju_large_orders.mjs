import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));
const manju = data['Manjushree Kasture'];

const checkIndices = [18, 29, 79, 80, 90, 101, 104, 105, 106, 108];

for (const idx of checkIndices) {
  console.log(`\n=================== MANJU MSG ${idx} ===================`);
  console.log(manju[idx - 1].text);
}

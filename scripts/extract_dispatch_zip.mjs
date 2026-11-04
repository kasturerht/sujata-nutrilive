import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const zipPath = 'C:\\Users\\Admin\\Downloads\\WhatsApp Chat with Daily orders dispatch.zip';
const outDir = 'scripts/whatsapp_dispatch';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Reading zip:', zipPath);
const zip = new AdmZip(zipPath);
const zipEntries = zip.getEntries();

console.log(`Found ${zipEntries.length} entries in zip.`);
zipEntries.forEach(entry => {
  console.log(`- ${entry.entryName} (${entry.header.size} bytes)`);
});

zip.extractAllTo(outDir, true);
console.log('Successfully extracted all files to', outDir);

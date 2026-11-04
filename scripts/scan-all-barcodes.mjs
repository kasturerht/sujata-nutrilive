// scripts/scan-all-barcodes.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const searchDirs = ['src', 'public', 'scripts', 'data'];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.astro' || file === '.git' || file === 'dist' || file === '.vercel') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

const allFiles = searchDirs.map(d => path.join(rootDir, d)).flatMap(walk);
const barcodeRegex = /890\d{10}/g;

const matches = [];
for (const f of allFiles) {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      const found = line.match(barcodeRegex);
      if (found) {
        found.forEach(b => {
          matches.push({
            file: path.relative(rootDir, f).replace(/\\/g, '/'),
            line: idx + 1,
            barcode: b,
            codeSnippet: line.trim()
          });
        });
      }
    });
  } catch (e) {}
}

console.log('========================================================================');
console.log(`🔍 CODEBASE SCAN RESULTS: ${matches.length} BARCODE OCCURRENCES FOUND`);
console.log('========================================================================\n');

// Group by file
const grouped = {};
matches.forEach(m => {
  if (!grouped[m.file]) grouped[m.file] = [];
  grouped[m.file].push(m);
});

Object.keys(grouped).forEach(file => {
  console.log(`📁 File: ${file} (${grouped[file].length} occurrences)`);
  grouped[file].forEach(item => {
    console.log(`   Line ${item.line}: [${item.barcode}] -> ${item.codeSnippet}`);
  });
  console.log('');
});

// Also check all files that reference gtin, gtin13, or barcode
const gtinMatches = [];
for (const f of allFiles) {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if ((/gtin13/i.test(line) || /"gtin"/i.test(line) || /resolveVariantGtin13/i.test(line)) && !matches.some(m => m.file === path.relative(rootDir, f).replace(/\\/g, '/') && m.line === idx + 1)) {
        gtinMatches.push({
          file: path.relative(rootDir, f).replace(/\\/g, '/'),
          line: idx + 1,
          codeSnippet: line.trim()
        });
      }
    });
  } catch (e) {}
}

console.log('========================================================================');
console.log(`🔍 LOGIC / CODE INJECTIONS OF GTIN13 (Without literal numbers): ${gtinMatches.length}`);
console.log('========================================================================\n');

const gtinGrouped = {};
gtinMatches.forEach(m => {
  if (!gtinGrouped[m.file]) gtinGrouped[m.file] = [];
  gtinGrouped[m.file].push(m);
});

Object.keys(gtinGrouped).forEach(file => {
  console.log(`📁 File: ${file} (${gtinGrouped[file].length} occurrences)`);
  gtinGrouped[file].forEach(item => {
    console.log(`   Line ${item.line}: ${item.codeSnippet}`);
  });
  console.log('');
});

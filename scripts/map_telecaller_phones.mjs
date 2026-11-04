// scripts/map_telecaller_phones.mjs
import fs from 'fs';

const audit = JSON.parse(fs.readFileSync('scripts/nexaleads_analysis_report.json', 'utf8'));
console.log('Telecaller Stats in NexaLeads:');
console.log(JSON.stringify(audit.telecallerStats, null, 2));

if (fs.existsSync('scripts/final_telecaller_deep_audit.json')) {
  const deep = JSON.parse(fs.readFileSync('scripts/final_telecaller_deep_audit.json', 'utf8'));
  console.log('\nDeep audit telecallers:');
  console.log(Object.keys(deep));
  if (deep.telecallers) {
    console.log(JSON.stringify(deep.telecallers, null, 2));
  }
}

// scripts/check_telecaller_names.mjs
import fs from 'fs';

const nexa = JSON.parse(fs.readFileSync('scripts/nexaleads_analysis_report.json', 'utf8'));

console.log('All Users in NexaLeads:');
Object.values(nexa.telecallerStats || {}).forEach(u => {
  console.log(`- ${u.name} (Phone: ${u.phone}, Email: ${u.email}, Role: ${u.role})`);
});

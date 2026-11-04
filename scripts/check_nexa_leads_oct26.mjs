// scripts/check_nexa_leads_oct26.mjs
import fs from 'fs';

const report = JSON.parse(fs.readFileSync('scripts/nexaleads_analysis_report.json', 'utf8'));
console.log('Report generated at:', report.generatedAt);
console.log('Total leads in dump:', report.summary?.totalLeads);

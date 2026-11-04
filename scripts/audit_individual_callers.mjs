import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/telecallers_all_messages_october.json', 'utf8'));

function auditCaller(name) {
  const msgs = data[name];
  console.log(`\n=======================================================`);
  console.log(`=== ${name.toUpperCase()} (Total ${msgs.length} messages) ===`);
  console.log(`=======================================================`);

  for (const m of msgs) {
    const text = m.text.replace(/\r?\n/g, ' \\n ');
    console.log(`[${m.idx}] ${m.date} ${m.time}: ${text}`);
  }
}

// Let's audit all of them or by argument
const target = process.argv[2] || 'Vaishnavi Diwate';
auditCaller(target);

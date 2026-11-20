// scripts/list_all_env_keys.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) {
    const key = m[1].trim();
    if (!key.startsWith('#')) {
      const val = m[2].trim().replace(/^['"]|['"]$/g, '');
      env[key] = val ? `${val.slice(0, 4)}...${val.slice(-4)}` : 'EMPTY';
    }
  }
});

console.log("All configured keys in .env:");
Object.keys(env).forEach(k => console.log(`- ${k}`));

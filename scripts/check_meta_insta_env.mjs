// scripts/check_meta_insta_env.mjs
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

const metaKeys = Object.keys(env).filter(k => 
  k.includes('META') || k.includes('INSTA') || k.includes('FB') || k.includes('FACEBOOK') || k.includes('PAGE')
);

console.log('Relevant keys in .env:');
metaKeys.forEach(k => {
  const val = env[k];
  console.log(`${k}: ${val ? (val.length > 15 ? val.slice(0, 10) + '...' + val.slice(-5) : val) : 'EMPTY'}`);
});

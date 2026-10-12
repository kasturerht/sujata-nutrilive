import fs from 'fs';
import path from 'path';

function checkEnvKeys() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) {
    console.log("No .env file found");
    return;
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const keys = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      keys.push(trimmed.substring(0, idx).trim());
    }
  }
  console.log("Available .env keys:", keys);
}

checkEnvKeys();

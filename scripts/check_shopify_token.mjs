import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      process.env[trimmed.substring(0, idx).trim()] = val;
    }
  }
}
loadEnv();

console.log("Token prefix:", process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.substring(0, 8));
console.log("Token length:", process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.length);
console.log("Storefront Token prefix:", process.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN?.substring(0, 8));
console.log("Storefront Token length:", process.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN?.length);
console.log("Has Client ID:", !!process.env.SHOPIFY_CLIENT_ID);
console.log("Has Client Secret:", !!process.env.SHOPIFY_CLIENT_SECRET);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.substring(0, idx).trim()] = val;
      }
    }
  }
}
loadEnv();

const instanceId = process.env.WHATSAPP_GATEWAY_INSTANCE_ID;
const token = process.env.WHATSAPP_GATEWAY_TOKEN;
const telecallerPhone = process.env.TELECALLER_WHATSAPP_NUMBER;
const dispatchGroupId = process.env.DISPATCH_WHATSAPP_GROUP_ID;

async function listGroups() {
  if (!instanceId || !token) {
    console.error('❌ Error: WHATSAPP_GATEWAY_INSTANCE_ID or WHATSAPP_GATEWAY_TOKEN missing in .env');
    return;
  }
  console.log(`📡 Fetching WhatsApp Groups from UltraMsg instance ${instanceId}...`);
  const url = `https://api.ultramsg.com/${instanceId}/groups?token=${token}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('\n=== YOUR WHATSAPP GROUPS ===');
    if (Array.isArray(data)) {
      data.forEach((g, i) => {
        console.log(`[${i + 1}] Name: ${g.name} | Group ID: ${g.id}`);
      });
      console.log('\n👉 Copy your "Dispatch" Group ID and set it as DISPATCH_WHATSAPP_GROUP_ID in .env');
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error fetching groups:', err.message);
  }
}

async function sendTest(target, label) {
  const testMsg = `🌿 *SUJATA NUTRILIVE — ROUTING TEST ALERT*
━━━━━━━━━━━━━━━━━━━━━━━━

🛒 *Order:* #TEST-9999 • *₹1100.00* (${label === 'DISPATCH' ? 'PREPAID' : 'COD'})
📦 *Item:* Spirulina + Sea Buckthorn Combo (1-Month Plan) × 1

👤 *Client:* Test Customer • \`+91 98000 00000\`

📍 *Address:* Sujata Testing Unit, Nashik, MH - 422005

🌐 *Source:* Webhook Routing Test (${label})
━━━━━━━━━━━━━━━━━━━━━━━━`;

  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
  console.log(`\nSending test to ${label} (${target})...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: token,
        to: target,
        body: testMsg
      })
    });
    const data = await res.json();
    console.log(`Response for ${label}:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error sending to ${label}:`, err.message);
  }
}

async function main() {
  const cmd = process.argv[2] || 'status';

  console.log('========================================================');
  console.log('📲 SUJATA NUTRILIVE: WHATSAPP SMART ORDER ROUTING ENGINE');
  console.log('========================================================');
  console.log('Instance ID:', instanceId || 'NOT CONFIGURED');
  console.log('Telecaller Phone:', telecallerPhone || 'NOT CONFIGURED');
  console.log('Dispatch Group ID:', dispatchGroupId || 'NOT CONFIGURED');
  console.log('--------------------------------------------------------\n');

  if (cmd === 'groups') {
    await listGroups();
  } else if (cmd === 'test-telecaller') {
    if (!telecallerPhone) console.error('Set TELECALLER_WHATSAPP_NUMBER in .env first');
    else await sendTest(telecallerPhone, 'TELECALLER_COD');
  } else if (cmd === 'test-dispatch') {
    if (!dispatchGroupId) console.error('Set DISPATCH_WHATSAPP_GROUP_ID in .env first');
    else await sendTest(dispatchGroupId, 'DISPATCH_PREPAID');
  } else if (cmd === 'test-all') {
    if (telecallerPhone) await sendTest(telecallerPhone, 'TELECALLER_COD');
    if (dispatchGroupId) await sendTest(dispatchGroupId, 'DISPATCH_PREPAID');
  } else {
    console.log('Usage:');
    console.log('  node scripts/whatsapp-gateway.mjs groups           -> List all WhatsApp groups & their IDs');
    console.log('  node scripts/whatsapp-gateway.mjs test-telecaller  -> Send test COD alert to Telecaller phone');
    console.log('  node scripts/whatsapp-gateway.mjs test-dispatch    -> Send test Prepaid alert to Dispatch group');
    console.log('  node scripts/whatsapp-gateway.mjs test-all         -> Send test to both');
  }
}

main();

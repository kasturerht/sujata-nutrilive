import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.substring(0, idx).trim()] = val;
    }
  }
  return env;
}

const env = loadEnv();
const botToken = env.TELEGRAM_BOT_TOKEN;
const chatId = env.TELEGRAM_CHAT_ID;

if (!botToken || !chatId) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
  process.exit(1);
}

const stagingDir = path.join(rootDir, 'scratch', 'Sujata_Home_Sync_Stage');
const zipPath = path.join(rootDir, 'scratch', 'Sujata_Home_Sync_Package_12Oct2026.zip');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'bin') continue;
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildHomeZip() {
  console.log('Staging files for Home Sync Package...');
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  // 1. .env
  fs.copyFileSync(path.join(rootDir, '.env'), path.join(stagingDir, '.env'));

  // 2. data folder
  copyDir(path.join(rootDir, 'data'), path.join(stagingDir, 'data'));

  // 3. scripts folder (without large bin/ffmpeg)
  copyDir(path.join(rootDir, 'scripts'), path.join(stagingDir, 'scripts'));

  // 4. Reports & Blueprints
  const reportsDir = path.join(stagingDir, 'reports_and_blueprints');
  fs.mkdirSync(reportsDir, { recursive: true });
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\186e606a-42f4-4ae8-ad8b-afc2ccc04c40';
  const reportFiles = [
    'amazon_2026_cosmo_seo_master_plan.md',
    'meta_ads_deep_audit_and_2026_playbook.md',
    'sujata_360_technical_and_strategic_audit_oct2026.md',
    'ai_recommendation_forensic_diagnosis_and_2day_action_plan.md'
  ];
  for (const rf of reportFiles) {
    const fullP = path.join(artifactDir, rf);
    if (fs.existsSync(fullP)) {
      fs.copyFileSync(fullP, path.join(reportsDir, rf));
    }
  }

  // 5. Instruction text file
  const instructions = `========================================================================
SUJATA NUTRILIVE - HOME SYSTEM SYNC GUIDE (12-OCT-2026)
========================================================================

STEP 1: GitHub Repo Update
--------------------------
तुमच्या घरच्या सिस्टमवर प्रोजेक्ट फोल्डरमध्ये टर्मिनल उघडून कमांड चालवा:
  git pull origin main

STEP 2: या ZIP मधील फाईल्स प्रोजेक्ट फोल्डरमध्ये कॉपी करा
-----------------------------------------------------------
या ZIP फाईलमधील फाईल्स तुमच्या प्रोजेक्ट रूटमध्ये पेस्ट करा:
  - .env (आज जोडलेले Meta Ads व Amazon SP-API कीज)
  - data/ (आजची नवीन ऑर्डर #1019 आणि Amazon चे 0-Errors ऑडिट रिझल्ट्स)
  - scripts/ (Google Cloud SEO credentials & automation scripts)
  - reports_and_blueprints/ (आजचे मास्टर रिसर्च व स्ट्रॅटेजी डॉक्युमेंट्स)

बस्स! तुमचे ऑफिस आणि घरचे काम १००% एकसमान सिंक राहील.
========================================================================
`;
  fs.writeFileSync(path.join(stagingDir, 'README_HOME_SYNC.txt'), instructions, 'utf8');

  // Create zip using PowerShell
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  console.log('Compressing into ZIP archive...');
  const psCmd = `Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${zipPath}' -Force`;
  execSync(`powershell.exe -NoProfile -Command "${psCmd}"`, { stdio: 'inherit' });
  const sizeMb = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(2);
  console.log(`✓ Created ${zipPath} (${sizeMb} MB)`);
}

async function sendTelegramDoc(filePath, fileName, caption) {
  console.log(`\nDispatching ${fileName} to Telegram Chat ID ${chatId}...`);
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('document', blob, fileName);
  if (caption) formData.append('caption', caption);

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (data.ok) {
    console.log(`✅ Sent ${fileName}! Message ID: ${data.result?.message_id}`);
    return true;
  } else {
    console.error(`❌ Failed ${fileName}:`, JSON.stringify(data));
    return false;
  }
}

async function sendTelegramMessage(text) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown'
    })
  });
  const data = await res.json();
  return data.ok;
}

async function main() {
  buildHomeZip();

  // 1. Send .env file directly
  await sendTelegramDoc(
    path.join(rootDir, '.env'),
    '.env',
    '🔐 Sujata Nutrilive: Updated .env configuration file (Includes today\'s Meta Ads Account ID & Access Token + Amazon SP-API & Shopify tokens).'
  );

  // 2. Send complete sync zip
  await sendTelegramDoc(
    zipPath,
    'Sujata_Home_Sync_Package_12Oct2026.zip',
    '📦 Sujata Nutrilive: Complete Home Sync Package (12-Oct-2026)\nContains all non-git data dumps, today\'s new Order #1019 record, Google Cloud SEO credentials & 2026 Master Blueprints.'
  );

  // 3. Send instructions message
  const msg = `🚀 *Sujata Nutrilive: Home System Sync Guide (12-Oct-2026)*\n\n` +
    `घरी गेल्यावर सिंक करण्यासाठी पुढील ३ सोप्या स्टेप्स करा:\n\n` +
    `1️⃣ *GitHub Repo Update:*\n\`git pull origin main\`\n(याने आजचे सर्व कोड, Amazon 4-Phase scripts आणि इमेजेस तुमच्याकडे अपडेट होतील)\n\n` +
    `2️⃣ *Environment Variables:*\nवरील पाठवलेली \`.env\` फाईल थेट तुमच्या प्रोजेक्ट रूट फोल्डरमध्ये टाका (यात आजचे Meta Ads व Amazon चे अद्ययावत टोकन्स आहेत).\n\n` +
    `3️⃣ *Data & Credentials:*\n\`Sujata_Home_Sync_Package_12Oct2026.zip\` अनझिप करा. त्यातील \`data/\`, \`scripts/\` आणि \`reports_and_blueprints/\` फाईल्स तुमच्या प्रोजेक्टमध्ये रिप्लेस/मर्ज करा.\n\n` +
    `✅ सर्व सिस्टम १००% ऑफिस व होम मध्ये एकसमान सिंक राहील!`;

  await sendTelegramMessage(msg);
  console.log('\n🎉 All sync packages and instructions sent to Telegram successfully!');
}

main().catch(console.error);

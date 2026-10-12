import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const stagingDir = path.join(rootDir, 'Sujata_Office_Sync_Package');
const zipFileProject = path.join(rootDir, 'Sujata_Office_Sync_Package.zip');
const desktopDir = 'C:\\Users\\Prime\\Desktop';
const zipFileDesktop = path.join(desktopDir, 'Sujata_Office_Sync_Package.zip');

console.log("Preparing Office Sync Package...");

// Clean existing staging
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy .env
if (fs.existsSync(path.join(rootDir, '.env'))) {
  fs.copyFileSync(path.join(rootDir, '.env'), path.join(stagingDir, '.env'));
  console.log("✓ Copied .env");
}

// 2. Copy data folder
if (fs.existsSync(path.join(rootDir, 'data'))) {
  copyDir(path.join(rootDir, 'data'), path.join(stagingDir, 'data'));
  console.log("✓ Copied data folder (Excel & JSON catalogs)");
}

// 3. Copy Brand_Registry_Files
if (fs.existsSync(path.join(rootDir, 'Brand_Registry_Files'))) {
  copyDir(path.join(rootDir, 'Brand_Registry_Files'), path.join(stagingDir, 'Brand_Registry_Files'));
  console.log("✓ Copied Brand_Registry_Files");
}

// 4. Copy scripts folder
if (fs.existsSync(path.join(rootDir, 'scripts'))) {
  copyDir(path.join(rootDir, 'scripts'), path.join(stagingDir, 'scripts'));
  console.log("✓ Copied scripts folder (Amazon & Shopify Automation engines)");
}

// 5. Copy any untracked public assets
const soapImg = path.join(rootDir, 'public', 'products', 'sujata-spiruglow-soap-main-clean.jpg');
if (fs.existsSync(soapImg)) {
  const destImgDir = path.join(stagingDir, 'public', 'products');
  fs.mkdirSync(destImgDir, { recursive: true });
  fs.copyFileSync(soapImg, path.join(destImgDir, 'sujata-spiruglow-soap-main-clean.jpg'));
  console.log("✓ Copied untracked public product image");
}

// 6. Create quick instructions file
const instructions = `========================================================================
SUJATA NUTRILIVE - OFFICE SYSTEM SETUP GUIDE
========================================================================

हे पॅकेज तुमच्या ऑफिसच्या सिस्टीमवर कसे वापरायचे:

STEP 1: GitHub वरून कोड पुल करा
----------------------------------
तुमच्या ऑफिसच्या सिस्टीमवर प्रोजेक्ट फोल्डरमध्ये टर्मिनल उघडून कमांड चालवा:
  git pull origin main

STEP 2: या ZIP मधील फाईल्स प्रोजेक्ट फोल्डरमध्ये कॉपी करा
-----------------------------------------------------------
या ZIP फाईलमधील खालील सर्व गोष्टी थेट तुमच्या प्रोजेक्टच्या रूट फोल्डरमध्ये 
(d:\\Sujata Nutrilive\\Website\\Sujata-Nutrilive - v1 किंवा ऑफिसचा प्रोजेक्ट पाथ) पेस्ट करा:
  - .env (सर्व Shopify & Amazon API कीज)
  - data/ (सर्व Excel फाईल्स, MRP शीट्स आणि कॅटलॉग डंप)
  - scripts/ (सर्व ऑटोमेशन आणि सिंक स्क्रीप्ट्स)
  - Brand_Registry_Files/ (अॅमेझॉन ब्रँड रजिस्ट्री डॉक्युमेंट्स)
  - public/products/ (नवीन इमेज अॅसेट्स)

STEP 3: डिपेंडन्सीज तपासणे (आवश्यक असल्यास)
---------------------------------------------
  npm install

बस्स! तुमचे काम एका सेकंदाचाही खंड न पडता जसेच्या तसे सुरू होईल.
========================================================================
`;
fs.writeFileSync(path.join(stagingDir, 'README_OFFICE_SETUP.txt'), instructions, 'utf8');
console.log("✓ Created README_OFFICE_SETUP.txt");

// 7. Create ZIP archive using PowerShell Compress-Archive
console.log("Creating ZIP archive...");
if (fs.existsSync(zipFileProject)) fs.unlinkSync(zipFileProject);

const psCommand = `Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${zipFileProject}' -Force`;
execSync(`powershell.exe -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' });
console.log(`✓ Created ZIP in project folder: ${zipFileProject}`);

// 8. Copy ZIP to Desktop
if (fs.existsSync(desktopDir)) {
  fs.copyFileSync(zipFileProject, zipFileDesktop);
  console.log(`✓ Copied ZIP to Desktop: ${zipFileDesktop}`);
}

const stats = fs.statSync(zipFileProject);
console.log(`\n🎉 Success! Package Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

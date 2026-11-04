import fs from 'fs';

const envPath = '.env';
let content = fs.readFileSync(envPath, 'utf8');
if (!content.includes('GMAIL_USER=')) {
  content += '\n\n# Google / Gmail Service Credentials\nGMAIL_USER="sujatanutrilive@gmail.com"\nGMAIL_APP_PASSWORD="ysla kiuk wjju kbct"\n';
  fs.writeFileSync(envPath, content, 'utf8');
  console.log('✅ Gmail credentials safely saved to .env');
} else {
  console.log('ℹ️ GMAIL_USER already present in .env');
}

import nodemailer from 'nodemailer';
import fs from 'fs';

const env = {};
fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
});

async function testSend() {
  console.log("Testing SMTP send from", env.GMAIL_USER);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD
    }
  });

  const info = await transporter.sendMail({
    from: `"Sujata Nutrilive Order Bot" <${env.GMAIL_USER}>`,
    to: 'sujatanutrilive@gmail.com',
    subject: '🧪 [Test Alert] Sujata Nutrilive Automated Order Dispatch',
    text: 'Test order notification engine verification. Orders will be delivered directly here without depending on third-party app quirks!'
  });

  console.log("Sent successfully! Message ID:", info.messageId);
}

testSend().catch(e => console.error("SMTP error:", e.message));

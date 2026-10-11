// scripts/autopilot_social_publisher.mjs
// 🚀 SUJATA NUTRILIVE: OMNI-CHANNEL SOCIAL MEDIA AUTOPILOT ENGINE (2026)
// Automatically monitors Google Drive Queue -> Publishes to Facebook, Instagram & YouTube -> Notifies via Telegram -> Moves to Archive

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createMotionReel, selectAudioTheme } from './motion_reel_generator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. CONFIG & CREDENTIALS LOADER ---
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = { ...process.env };
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!env[k]) env[k] = v;
      }
    });
  }
  return env;
}

const env = loadEnv();

// Google Service Account Credentials
function getGoogleKey() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      console.error('Error parsing GOOGLE_SERVICE_ACCOUNT_KEY from env:', e.message);
    }
  }
  const keyFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.json') && f.includes('sujata-nutrilive-seo'));
  if (keyFiles.length > 0) {
    return JSON.parse(fs.readFileSync(path.join(__dirname, keyFiles[0]), 'utf-8'));
  }
  throw new Error('Google Service Account key not found.');
}

const googleKey = getGoogleKey();

const QUEUE_FOLDER_ID = env.GOOGLE_DRIVE_QUEUE_FOLDER_ID || '1_Ojcl3nsEDEt6ia0WdgUcnun30C_Q2Zv';
const POSTED_FOLDER_ID = env.GOOGLE_DRIVE_POSTED_FOLDER_ID || '1qDgrCxOQQ3xuVS5YJtzt-qfL23rxd1u-';
const META_PAGE_ID = env.META_PAGE_ID || '356279144243520';
const META_PAGE_ACCESS_TOKEN = env.META_PAGE_ACCESS_TOKEN;
const META_INSTAGRAM_ACCOUNT_ID = env.META_INSTAGRAM_ACCOUNT_ID || '17841468384194114';
const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = env.TELEGRAM_CHAT_ID;

// --- 2. GOOGLE OAUTH JWT HELPER ---
function createGoogleJwt(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: googleKey.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const signInput = base64Url(header) + '.' + base64Url(payload);
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signInput);
  const signature = sign.sign(googleKey.private_key, 'base64url');
  return signInput + '.' + signature;
}

let cachedGoogleAccessToken = null;
let googleTokenExpiresAt = 0;

async function getGoogleAccessToken(scopes = ['https://www.googleapis.com/auth/drive']) {
  if (cachedGoogleAccessToken && Date.now() < googleTokenExpiresAt) {
    return cachedGoogleAccessToken;
  }
  const jwt = createGoogleJwt(scopes);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Failed to obtain Google access token: ' + JSON.stringify(data));
  }
  cachedGoogleAccessToken = data.access_token;
  googleTokenExpiresAt = Date.now() + ((data.expires_in || 3600) - 300) * 1000;
  return cachedGoogleAccessToken;
}

// --- 3. TELEGRAM BOT NOTIFIER ---
async function sendTelegramAlert(htmlMessage) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️ Telegram credentials not configured. Skipping alert.');
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: htmlMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });
    const resData = await res.json();
    if (resData.ok) {
      console.log('✅ Telegram alert sent successfully!');
    } else {
      console.error('❌ Telegram error:', resData.description);
    }
  } catch (err) {
    console.error('❌ Failed to send Telegram alert:', err.message);
  }
}

// --- 4. BRAND CAPTION GENERATOR ---
function generateBrandCaption(fileName, customText = '') {
  if (customText && customText.trim().length > 10) {
    return customText.trim();
  }

  const cleanName = fileName.toLowerCase().replace(/[-_.]/g, ' ');

  let productFocus = 'सुजाता न्युट्रीलाईव्ह आयुर्वेदिक उत्पादने';
  let benefits = [
    '✨ १००% शुद्ध, नैसर्गिक व रसायनमुक्त',
    '🌿 उच्च दर्जाच्या शेतीतून थेट तुमच्या घरापर्यंत',
    '💪 रोगप्रतिकारशक्ती आणि शारीरिक ऊर्जेसाठी अत्यंत गुणकारी',
    '🔬 लॅब-प्रमाणित आणि आयुर्वेदिक परंपरेने समृद्ध'
  ];

  let customHashtags = '#sujatanutrilive #ayurvedicwellness #organicfarming #moringapowder #marathihealthtips #puresujata #healthyindia #healthylifestyle #ayurvedalife #maharashtranutrition';

  if (cleanName.includes('navaratri') || cleanName.includes('navratri') || cleanName.includes('नवरात्र')) {
    productFocus = `🌸 घटस्थापना व पावन नवरात्रोत्सवाच्या सुजाता न्युट्रीलाईव्ह परिवारातर्फे हार्दिक शुभेच्छा! 🌸
"Wishing you a Navratri full of colors, light, good health & joyful memories." ✨

सणांचे रंग, गरब्याचा उत्साह आणि देवी दुर्गेच्या पावन आशीर्वादाने आपले आयुष्य उत्तम आरोग्य, ऊर्जा आणि समाधानाने उजळून निघो! 🙏

🌿 नवरात्रीच्या ९ दिवसांच्या उपवासात आणि गरब्याच्या जल्लोषात आपल्या शरीराची ऊर्जा टिकवून ठेवण्यासाठी सुजाता न्युट्रीलाईव्हचे १००% नैसर्गिक व सात्त्विक सुपरफूड्स:`;
    benefits = [
      '✨ उपवासातील थकवा, चक्कर आणि अशक्तपणा दूर करून अखंड ऊर्जा (Stamina) टिकवून ठेवते',
      '🌿 शरीराला आवश्यक नैसर्गिक व्हिटॅमिन्स, मिनरल्स व अँटीऑक्सिडंट्सचा परिपूर्ण साठा',
      '🩺 उपवासाच्या काळात पचनक्रिया सुरळीत ठेवून ॲसिडिटी व पित्तापासून नैसर्गिक आराम',
      '💚 १००% सात्त्विक, शुद्ध शेतीतून थेट आणि कोणत्याही प्रिझर्व्हेटिव्ह विरहित!'
    ];
    customHashtags = '#ShubhNavratri #Navratri2026 #SujataNutrilive #HappyNavratri #नवरात्रोत्सव #FastingHealth #SatvikAhar #GarbaVibes #DandiyaNights #AyurvedicWellness #MoringaPower #PureAyurveda #MarathiHealthTips #MaharashtraFestivals';
  } else if (cleanName.includes('diwali') || cleanName.includes('दिवाळी')) {
    productFocus = '🪔 दीपोत्सवाच्या हार्दिक शुभेच्छा! 🪔\nया दिवाळीत आपल्या कुटुंबाला द्या शुद्ध निरोगी आरोग्याची मौल्यवान भेट!';
    benefits = [
      '✨ सणासुदीच्या गोडधोड खाण्यानंतर पचनक्रिया संतुलित राखण्यास मदत',
      '🌿 शरीरातील टॉक्सिन्स बाहेर काढून नैसर्गिक डिटॉक्सिफिकेशन',
      '💚 १००% शुद्ध आणि केमिकल-फ्री नैसर्गिक पोषण'
    ];
    customHashtags = '#DiwaliHealth #SujataNutrilive #HealthyDiwali #AyurvedicCare #PureAyurveda #MarathiFestivals';
  } else if (cleanName.includes('moringa') || cleanName.includes('शेवगा')) {
    productFocus = 'सुजाता न्युट्रीलाईव्ह सुपरफूड शेवगा (Moringa) पावडर 🌱';
    benefits = [
      '✨ ९०+ पोषकतत्वे, ४६ अँटीऑक्सिडंट्स आणि १८ अमिनो ॲसिडचा खजिना',
      '🌿 सांधेदुखी, थकवा आणि अशक्तपणा दूर करण्यासाठी अत्यंत गुणकारी',
      '🩺 रक्तदाब, साखर आणि कोलेस्ट्रॉल नियंत्रणात ठेवण्यास मदत',
      '💚 १००% शुद्ध शेवगा पानांची पावडर — कोणतेही प्रिझर्वेटिव्ह नाही!'
    ];
  } else if (cleanName.includes('amla') || cleanName.includes('आवळा')) {
    productFocus = 'सुजाता न्युट्रीलाईव्ह शुद्ध आवळा पावडर 🌱';
    benefits = [
      '✨ व्हिटॅमिन C चा समृद्ध नैसर्गिक स्रोत',
      '🌿 पचनक्रिया सुधारून केस आणि त्वचेसाठी सर्वोत्तम',
      '💪 शरीरातील टॉक्सिन्स बाहेर काढून रोगप्रतिकारशक्ती वाढवते'
    ];
  } else if (cleanName.includes('triphala') || cleanName.includes('त्रिफळा')) {
    productFocus = 'सुजाता न्युट्रीलाईव्ह त्रिफळा चूर्ण 🌱';
    benefits = [
      '✨ हरडा, बहेडा आणि आवळा यांचे सुवर्ण संतुलन',
      '🌿 गॅस, ॲसिडिटी आणि बद्धकोष्ठतेवर रामबाण उपाय',
      '💚 पचनसंस्थेचे नैसर्गिक डिटॉक्सिफिकेशन'
    ];
  }

  const caption = `${productFocus}

मुख्य फायदे:
${benefits.join('\n')}

🛒 आजच घरपोच मागवा:
👉 वेबसाइट: https://www.sujatanutrilive.com
📞 मोफत सल्ला व ऑर्डरसाठी कॉल/व्हॉट्सॲप करा: +91 93566 23071
💬 थेट व्हॉट्सॲप: https://wa.me/919356623071?text=मला%20सुजाता%20न्युट्रीलाईव्ह%20उत्पादने%20हवी%20आहेत

${customHashtags}`;

  return caption;
}

// --- 4.1 SMART SCHEDULING PARSER (DATE & TIME) ---
// Analyzes filename for scheduled dates and times (e.g. '2026-10-11_14-30_post.png', '11-oct_2-30pm_post.png', '2026-10-15_post.png')
// If date & time are in the future, file stays in queue safely with minute-level countdown.
// If scheduled time has arrived/passed, or no schedule is specified, it is ready for immediate publication.
function checkFileSchedule(fileName) {
  const now = new Date();

  // Current time in IST (UTC+5:30)
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);
  const currentYear = istNow.getUTCFullYear();
  const currentMonth = istNow.getUTCMonth() + 1; // 1-12
  const currentDay = istNow.getUTCDate();

  const monthNames = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  };

  let cleanName = fileName.toLowerCase();

  // 1. DATE PARSING
  let targetYear = currentYear;
  let targetMonth = null;
  let targetDay = null;

  const matchYMD = cleanName.match(/(\d{4})[\-_](\d{1,2})[\-_](\d{1,2})/);
  const matchDMY = cleanName.match(/(?:^|[\-_])(\d{1,2})[\-_](\d{1,2})[\-_](\d{4})/);
  const matchDMon = cleanName.match(/(?:^|[\-_])(\d{1,2})[\-_]?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);

  if (matchYMD) {
    targetYear = parseInt(matchYMD[1], 10);
    targetMonth = parseInt(matchYMD[2], 10);
    targetDay = parseInt(matchYMD[3], 10);
    cleanName = cleanName.replace(matchYMD[0], ' ');
  } else if (matchDMY) {
    targetDay = parseInt(matchDMY[1], 10);
    targetMonth = parseInt(matchDMY[2], 10);
    targetYear = parseInt(matchDMY[3], 10);
    cleanName = cleanName.replace(matchDMY[0], ' ');
  } else if (matchDMon) {
    targetDay = parseInt(matchDMon[1], 10);
    targetMonth = monthNames[matchDMon[2]];
    cleanName = cleanName.replace(matchDMon[0], ' ');
  }

  // 2. TIME PARSING on remainder (supports 12-hr with am/pm or 24-hr formats)
  let targetHour = null;
  let targetMinute = 0;

  // 12-hour: e.g., 2-30pm, 02-30-pm, 2pm, 11-45am, 11am
  const match12h = cleanName.match(/(?:^|[\-_\s])(\d{1,2})(?:[\-_:h](\d{2}))?\s*(am|pm)(?:$|[\-_\s\.])/);
  // 24-hour: e.g., 14-30, 14:30, 09-15, 18h30
  const match24h = cleanName.match(/(?:^|[\-_\s])([01]?\d|2[0-3])[\-_:h]([0-5]\d)(?:$|[\-_\s\.])/);

  if (match12h) {
    let h = parseInt(match12h[1], 10);
    const m = match12h[2] ? parseInt(match12h[2], 10) : 0;
    const meridian = match12h[3];
    if (meridian === 'pm' && h < 12) h += 12;
    if (meridian === 'am' && h === 12) h = 0;
    targetHour = h;
    targetMinute = m;
  } else if (match24h) {
    targetHour = parseInt(match24h[1], 10);
    targetMinute = parseInt(match24h[2], 10);
  }

  // If no date was given:
  if (targetDay === null || targetMonth === null) {
    if (targetHour !== null) {
      // Time given without date -> assume today
      targetDay = currentDay;
      targetMonth = currentMonth;
      targetYear = currentYear;
    } else {
      // No date and no time -> ready immediately!
      return { isReady: true, noSchedule: true, label: 'Immediate' };
    }
  }

  // If date was given, but NO time:
  // If date is today or past, ready immediately; if future, default to 00:00:00 (start of that day)
  if (targetHour === null) {
    targetHour = 0;
    targetMinute = 0;
  }

  // Target timestamp in UTC (IST is UTC+5:30)
  const targetUtcMs = Date.UTC(targetYear, targetMonth - 1, targetDay, targetHour, targetMinute, 0) - istOffsetMs;
  const currentUtcMs = now.getTime();

  const isReady = currentUtcMs >= targetUtcMs;
  const diffMinutes = Math.round((targetUtcMs - currentUtcMs) / 60000);

  const formattedTarget = `${targetDay.toString().padStart(2, '0')}/${targetMonth.toString().padStart(2, '0')}/${targetYear} ${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')} IST`;

  return {
    isReady,
    isFuture: !isReady,
    targetUtcMs,
    diffMinutes,
    scheduledDateTime: formattedTarget
  };
}

// --- 5. GOOGLE DRIVE QUEUE OPERATIONS ---
async function fetchDriveQueue() {
  const token = await getGoogleAccessToken();
  const query = encodeURIComponent(`'${QUEUE_FOLDER_ID}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,createdTime)&orderBy=createdTime asc`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.files || [];
}

async function downloadDriveFile(fileId) {
  const token = await getGoogleAccessToken();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Failed to download Drive file ${fileId}: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function moveFileToPosted(fileId) {
  const token = await getGoogleAccessToken();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${POSTED_FOLDER_ID}&removeParents=${QUEUE_FOLDER_ID}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    console.error(`⚠️ Could not move file ${fileId} to Posted:`, await res.text());
  } else {
    console.log(`📦 Moved file ${fileId} to Posted folder.`);
  }
}

async function makeDriveFilePublic(fileId) {
  const token = await getGoogleAccessToken();
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' })
    });
  } catch (e) {
    console.warn('Note on file permission:', e.message);
  }
}

// --- 6. META FACEBOOK PAGE PUBLISHING ---
async function publishToFacebookPage(fileBuffer, mimeType, caption) {
  console.log('📘 Publishing to Facebook Page (ID:', META_PAGE_ID, ')...');
  const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');

  const formDataParts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="published"\r\n\r\ntrue\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="access_token"\r\n\r\n${META_PAGE_ACCESS_TOKEN}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="source"; filename="upload.${mimeType.includes('png') ? 'png' : 'jpg'}"\r\nContent-Type: ${mimeType}\r\n\r\n`
  ];

  const part1Buffer = Buffer.from(formDataParts.join(''));
  const part2Buffer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const fullBody = Buffer.concat([part1Buffer, fileBuffer, part2Buffer]);

  const res = await fetch(`https://graph.facebook.com/v21.0/${META_PAGE_ID}/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': fullBody.length.toString()
    },
    body: fullBody
  });

  const data = await res.json();
  if (data.id) {
    console.log('✅ Facebook photo published! Post ID:', data.post_id || data.id);
    return {
      success: true,
      id: data.id,
      postId: data.post_id || data.id,
      url: `https://www.facebook.com/${data.post_id || data.id}`
    };
  } else {
    throw new Error('Facebook publish error: ' + JSON.stringify(data));
  }
}

// --- 7. META INSTAGRAM FEED PUBLISHING ---
async function publishToInstagramFeed(driveFileId, caption) {
  console.log('📸 Publishing to Instagram Feed (@sujatanutrilive)...');
  await makeDriveFilePublic(driveFileId);

  // Direct Google Drive image link
  const imageUrl = `https://lh3.googleusercontent.com/d/${driveFileId}`;

  // Step 1: Create Instagram media container
  const createContainerUrl = `https://graph.facebook.com/v21.0/${META_INSTAGRAM_ACCOUNT_ID}/media`;
  const containerRes = await fetch(createContainerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      image_url: imageUrl,
      caption: caption,
      access_token: META_PAGE_ACCESS_TOKEN
    })
  });

  const containerData = await containerRes.json();
  if (!containerData.id) {
    throw new Error('Instagram container creation failed: ' + JSON.stringify(containerData));
  }

  const containerId = containerData.id;
  console.log('⏳ Instagram container created:', containerId, 'Waiting 5s for processing...');
  await new Promise(r => setTimeout(r, 5000));

  // Step 2: Publish container
  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${META_INSTAGRAM_ACCOUNT_ID}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      creation_id: containerId,
      access_token: META_PAGE_ACCESS_TOKEN
    })
  });

  const publishData = await publishRes.json();
  if (!publishData.id) {
    throw new Error('Instagram media_publish failed: ' + JSON.stringify(publishData));
  }

  console.log('✅ Instagram media published successfully! ID:', publishData.id);

  // Retrieve permalink
  let permalink = `https://www.instagram.com/sujatanutrilive/`;
  try {
    const mediaInfoRes = await fetch(`https://graph.facebook.com/v21.0/${publishData.id}?fields=permalink,shortcode&access_token=${META_PAGE_ACCESS_TOKEN}`);
    const mediaInfo = await mediaInfoRes.json();
    if (mediaInfo.permalink) permalink = mediaInfo.permalink;
  } catch (e) {
    console.warn('Could not retrieve exact IG permalink:', e.message);
  }

  return {
    success: true,
    id: publishData.id,
    url: permalink
  };
}

// --- 7.1 META INSTAGRAM REELS (VIDEO/MOTION WITH MUSIC) PUBLISHING ---
async function publishToInstagramReel(videoBuffer, caption) {
  console.log('📸 Publishing to Instagram Reels (@sujatanutrilive) with Thematic Music...');

  // Step 1: Initialize Resumable Upload Container
  const createUrl = `https://graph.facebook.com/v21.0/${META_INSTAGRAM_ACCOUNT_ID}/media`;
  const initRes = await fetch(createUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      media_type: 'REELS',
      upload_type: 'resumable',
      caption: caption,
      access_token: META_PAGE_ACCESS_TOKEN
    })
  });

  const initData = await initRes.json();
  if (!initData.id || !initData.uri) {
    throw new Error('Instagram Reels container init failed: ' + JSON.stringify(initData));
  }

  const containerId = initData.id;
  const uploadUri = initData.uri;
  console.log(`⏳ Instagram Reel container initialized (ID: ${containerId}). Uploading video binary...`);

  // Step 2: Upload Video Bytes directly to Meta's rupload endpoint
  const uploadRes = await fetch(uploadUri, {
    method: 'POST',
    headers: {
      Authorization: `OAuth ${META_PAGE_ACCESS_TOKEN}`,
      offset: '0',
      file_size: videoBuffer.length.toString(),
      'Content-Type': 'application/octet-stream'
    },
    body: videoBuffer
  });

  const uploadResult = await uploadRes.json();
  if (!uploadResult.success && uploadResult.status !== 200 && !uploadResult.id) {
    console.log('Note on Meta upload response:', uploadResult);
  }

  // Step 3: Poll status until Meta finishes video encoding (usually 5-15s)
  console.log('⏳ Waiting for Meta video processing (usually 5-15s)...');
  let isFinished = false;
  for (let attempt = 0; attempt < 15; attempt++) {
    await new Promise(r => setTimeout(r, 4000));
    const statusRes = await fetch(`https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${META_PAGE_ACCESS_TOKEN}`);
    const statusData = await statusRes.json();
    console.log(`⏳ Processing attempt ${attempt + 1}: status = ${statusData.status_code}`);
    if (statusData.status_code === 'FINISHED') {
      isFinished = true;
      break;
    } else if (statusData.status_code === 'ERROR') {
      throw new Error('Meta video processing failed with ERROR status');
    }
  }

  // Step 4: Publish Reel Container
  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${META_INSTAGRAM_ACCOUNT_ID}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      creation_id: containerId,
      access_token: META_PAGE_ACCESS_TOKEN
    })
  });

  const publishData = await publishRes.json();
  if (!publishData.id) {
    throw new Error('Instagram Reels media_publish failed: ' + JSON.stringify(publishData));
  }

  console.log('✅ Instagram Reel with Music published successfully! ID:', publishData.id);

  let permalink = 'https://www.instagram.com/sujatanutrilive/';
  try {
    const mediaInfoRes = await fetch(`https://graph.facebook.com/v21.0/${publishData.id}?fields=permalink,shortcode&access_token=${META_PAGE_ACCESS_TOKEN}`);
    const mediaInfo = await mediaInfoRes.json();
    if (mediaInfo.permalink) permalink = mediaInfo.permalink;
  } catch (e) {
    console.warn('Could not retrieve exact IG permalink:', e.message);
  }

  return {
    success: true,
    id: publishData.id,
    url: permalink
  };
}

// --- 8. YOUTUBE REFRESH TOKEN ACCESS ---
async function getYouTubeAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.YOUTUBE_CLIENT_ID,
      client_secret: env.YOUTUBE_CLIENT_SECRET,
      refresh_token: env.YOUTUBE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('YouTube access token refresh failed: ' + JSON.stringify(data));
  }
  return data.access_token;
}

// --- 9. YOUTUBE SHORTS PUBLISHING ---
async function publishToYouTubeShorts(fileBuffer, mimeType, title, description) {
  console.log('📺 Uploading to YouTube Shorts (@SujataNutrilive)...');
  const token = await getYouTubeAccessToken();

  const metadata = {
    snippet: {
      title: title.includes('#Shorts') ? title : `${title} #Shorts`,
      description: `${description}\n\n#Shorts #sujatanutrilive #ayurveda`,
      tags: ['Sujata Nutrilive', 'Shorts', 'Moringa', 'Ayurveda', 'Health Tips'],
      categoryId: '22'
    },
    status: {
      privacyStatus: 'public',
      selfDeclaredMadeForKids: false
    }
  };

  // Step 1: Initiate Resumable Upload
  const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType,
      'X-Upload-Content-Length': fileBuffer.length.toString()
    },
    body: JSON.stringify(metadata)
  });

  const uploadUrl = initRes.headers.get('location');
  if (!uploadUrl) {
    throw new Error('Failed to initiate YouTube resumable upload: ' + await initRes.text());
  }

  // Step 2: Upload bytes
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType,
      'Content-Length': fileBuffer.length.toString()
    },
    body: fileBuffer
  });

  const uploadData = await uploadRes.json();
  if (!uploadData.id) {
    throw new Error('YouTube upload failed: ' + JSON.stringify(uploadData));
  }

  const videoId = uploadData.id;
  const shortUrl = `https://youtube.com/shorts/${videoId}`;
  console.log('✅ YouTube Short published! Video URL:', shortUrl);

  return {
    success: true,
    id: videoId,
    url: shortUrl
  };
}

// --- 10. MAIN DISPATCHER ---
async function runAutopilot() {
  console.log('🤖 ========================================================');
  console.log('🤖 SUJATA OMNI-CHANNEL SOCIAL MEDIA AUTOPILOT ENGINE');
  console.log('🤖 Checking Google Drive queue for scheduled content...');
  console.log('🤖 ========================================================');

  const files = await fetchDriveQueue();
  console.log(`📁 Files found in queue folder: ${files.length}`);

  if (files.length === 0) {
    console.log('✨ Queue is clean. No pending posts.');
    return;
  }

  // Find any text/caption files
  const captionFiles = files.filter(f => f.name.endsWith('.txt'));

  // Filter media files and check schedule dates
  const mediaFiles = files.filter(f => !f.name.endsWith('.txt'));
  if (mediaFiles.length === 0) {
    console.log('No media files found to process.');
    return;
  }

  // Check schedule for all media files
  const readyFiles = [];
  const futureFiles = [];

  for (const file of mediaFiles) {
    const sched = checkFileSchedule(file.name);
    if (sched.isReady) {
      readyFiles.push({ file, sched });
    } else {
      futureFiles.push({ file, sched });
      const countdownStr = sched.diffMinutes > 0 ? ` (in ${sched.diffMinutes} mins)` : '';
      console.log(`⏳ Post '${file.name}' is scheduled for ${sched.scheduledDateTime}${countdownStr}. Holding in queue.`);
    }
  }

  if (readyFiles.length === 0) {
    console.log(`✨ All remaining files (${futureFiles.length}) are scheduled for future times. Waiting for scheduled slot.`);
    return;
  }

  // Priority: Earliest scheduled timestamp first (FIFO)
  readyFiles.sort((a, b) => (a.sched.targetUtcMs || 0) - (b.sched.targetUtcMs || 0));

  for (let i = 0; i < readyFiles.length; i++) {
    const targetFile = readyFiles[i].file;
    console.log(`\n🎯 [${i + 1}/${readyFiles.length}] Publishing ready media file: ${targetFile.name} (Type: ${targetFile.mimeType})`);

    // Detect custom caption file matching this specific media file
    let customCaption = '';
    let companionTextFile = null;
    const baseName = targetFile.name.substring(0, targetFile.name.lastIndexOf('.'));
    const matchedTextFile = captionFiles.find(f => f.name.startsWith(baseName)) || (captionFiles.length === 1 ? captionFiles[0] : null);

    if (matchedTextFile) {
      companionTextFile = matchedTextFile;
      const textBuffer = await downloadDriveFile(companionTextFile.id);
      customCaption = textBuffer.toString('utf-8');
      console.log(`📝 Detected matching custom caption file: ${companionTextFile.name}`);
    }

    const fileBuffer = await downloadDriveFile(targetFile.id);
    const caption = generateBrandCaption(targetFile.name, customCaption);

    const isVideo = targetFile.mimeType.startsWith('video/') || targetFile.name.endsWith('.mp4') || targetFile.name.endsWith('.mov');
    const isImage = targetFile.mimeType.startsWith('image/') || targetFile.name.match(/\.(jpg|jpeg|png|webp)$/i);

    const results = {
      facebook: null,
      instagram: null,
      youtube: null
    };

    if (isImage) {
      console.log(`🎨 Static image detected: ${targetFile.name}`);
      console.log(`🎵 Automatically pairing smart background music theme...`);

      // 1. Select matching theme audio track
      const audioSelection = selectAudioTheme(targetFile.name, caption);
      console.log(`🎼 Selected Music Theme: ${audioSelection.theme} (${path.basename(audioSelection.file)})`);

      // 2. Render 1080x1920 HD Motion Reel with Music
      const tempDir = path.join(__dirname, '..', 'scratch');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const safeBase = targetFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const tempImgPath = path.join(tempDir, `input_${Date.now()}_${targetFile.name}`);
      const tempReelPath = path.join(tempDir, `reel_${Date.now()}_${safeBase}.mp4`);

      fs.writeFileSync(tempImgPath, fileBuffer);

      let motionReelBuffer = null;
      try {
        await createMotionReel(tempImgPath, audioSelection.file, tempReelPath, 12);
        motionReelBuffer = fs.readFileSync(tempReelPath);
        console.log(`✨ Motion Reel with Music ready! Size: ${(motionReelBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
      } catch (err) {
        console.warn(`⚠️ FFmpeg Motion Reel notice: ${err.message}. Falling back to standard image.`);
      }

      // 3. Post to Facebook (High-res Photo Feed)
      try {
        results.facebook = await publishToFacebookPage(fileBuffer, targetFile.mimeType || 'image/jpeg', caption);
      } catch (e) {
        console.error('❌ Facebook photo error:', e.message);
        results.facebook = { error: e.message };
      }

      // 4. Post to Instagram (As Music Reel if motion reel generated, else fallback to standard image)
      try {
        if (motionReelBuffer) {
          results.instagram = await publishToInstagramReel(motionReelBuffer, caption);
        } else {
          results.instagram = await publishToInstagramFeed(targetFile.id, caption);
        }
      } catch (e) {
        console.error('❌ Instagram error:', e.message);
        results.instagram = { error: e.message };
      }

      // 5. Post to YouTube Shorts (Since we now have a full 9:16 vertical video with music!)
      if (motionReelBuffer) {
        try {
          const cleanTitle = targetFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          results.youtube = await publishToYouTubeShorts(motionReelBuffer, 'video/mp4', cleanTitle, caption);
        } catch (e) {
          console.warn('YouTube Shorts notice:', e.message);
        }
      }

      // Clean up temp files
      try {
        if (fs.existsSync(tempImgPath)) fs.unlinkSync(tempImgPath);
        if (fs.existsSync(tempReelPath)) fs.unlinkSync(tempReelPath);
      } catch (e) {}
    } else if (isVideo) {
      console.log(`🎬 Video detected: ${targetFile.name}. Keeping original audio intact (no music added).`);
      // 1. Post to YouTube Shorts
      try {
        const cleanTitle = targetFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        results.youtube = await publishToYouTubeShorts(fileBuffer, targetFile.mimeType || 'video/mp4', cleanTitle, caption);
      } catch (e) {
        console.error('❌ YouTube error:', e.message);
        results.youtube = { error: e.message };
      }

      // 2. Post to Facebook (as Video)
      try {
        const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');
        const formDataParts = [
          `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\n${caption}\r\n`,
          `--${boundary}\r\nContent-Disposition: form-data; name="access_token"\r\n\r\n${META_PAGE_ACCESS_TOKEN}\r\n`,
          `--${boundary}\r\nContent-Disposition: form-data; name="source"; filename="${targetFile.name}"\r\nContent-Type: ${targetFile.mimeType || 'video/mp4'}\r\n\r\n`
        ];
        const part1Buffer = Buffer.from(formDataParts.join(''));
        const part2Buffer = Buffer.from(`\r\n--${boundary}--\r\n`);
        const fullBody = Buffer.concat([part1Buffer, fileBuffer, part2Buffer]);

        const fbVidRes = await fetch(`https://graph.facebook.com/v21.0/${META_PAGE_ID}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': fullBody.length.toString()
          },
          body: fullBody
        });
        const fbVidData = await fbVidRes.json();
        if (fbVidData.id) {
          results.facebook = { success: true, id: fbVidData.id, url: `https://www.facebook.com/${fbVidData.id}` };
        }
      } catch (e) {
        console.error('❌ Facebook Video error:', e.message);
        results.facebook = { error: e.message };
      }
    }

    // Move files to Posted folder
    await moveFileToPosted(targetFile.id);
    if (companionTextFile) {
      await moveFileToPosted(companionTextFile.id);
    }

    // Compose Telegram Alert
    const linksHtml = [];
    if (results.facebook?.url) linksHtml.push(`📘 <b>Facebook:</b> <a href="${results.facebook.url}">पोस्ट पहा</a>`);
    if (results.instagram?.url) linksHtml.push(`📸 <b>Instagram:</b> <a href="${results.instagram.url}">इन्स्टाग्राम पोस्ट पहा</a>`);
    if (results.youtube?.url) linksHtml.push(`📺 <b>YouTube Shorts:</b> <a href="${results.youtube.url}">शॉर्ट्स व्हिडिओ पहा</a>`);

    const telegramMsg = `🚀 <b>सुजाता न्युट्रीलाईव्ह ऑटोपायलट: पोस्ट यशस्वीरीत्या प्रसिद्ध झाली!</b>

📁 <b>फाईल:</b> <code>${targetFile.name}</code>
🗓️ <b>तारीख व वेळ:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

🌐 <b>लाइव्ह लिंक्स:</b>
${linksHtml.length > 0 ? linksHtml.join('\n') : '<i>प्रक्रिया पूर्ण झाली.</i>'}

📝 <b>कॅपशन सारांश:</b>
<i>${caption.substring(0, 160)}...</i>

📦 <i>ही फाईल Drive मधील <b>'Posted'</b> आर्काइव्ह फोल्डरमध्ये हलवली आहे.</i>`;

    await sendTelegramAlert(telegramMsg);
    console.log(`🎉 [${i + 1}/${readyFiles.length}] Publishing completed for: ${targetFile.name}`);

    // Pause between multiple uploads to avoid rate limits
    if (i < readyFiles.length - 1) {
      console.log('⏳ Pausing 5s before next post...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log('✨ All scheduled ready posts have been published!');
}

// --- 11. ENTRY POINT (SINGLE RUN OR CONTINUOUS WATCH MODE) ---
const isWatchMode = process.argv.includes('--watch');

async function main() {
  if (isWatchMode) {
    console.log('👀 ========================================================');
    console.log('👀 SUJATA AUTOPILOT: 24/7 CONTINUOUS WATCH MODE ACTIVATED');
    console.log('👀 Checking Google Drive queue every 60 seconds...');
    console.log('👀 Day-time & exact minute schedule posts will fire on time!');
    console.log('👀 ========================================================');

    let isBusy = false;
    const pollCycle = async () => {
      if (isBusy) return;
      isBusy = true;
      try {
        await runAutopilot();
      } catch (err) {
        console.error('⚠️ Watch loop warning:', err.message);
      } finally {
        isBusy = false;
      }
    };

    await pollCycle();
    setInterval(pollCycle, 60000); // 60s polling
  } else {
    await runAutopilot();
  }
}

main().catch(err => {
  console.error('💥 FATAL AUTOPILOT ERROR:', err);
  process.exit(1);
});

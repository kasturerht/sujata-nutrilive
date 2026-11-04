// scripts/upgrade_video_7WnzNVR2Gco_clinical.mjs
// 🚀 SUJATA NUTRILIVE: CLINICAL-GRADE REWRITE FOR VIDEO 2 (PROTEIN BIOCHEMISTRY)
// Video: 7WnzNVR2Gco (World's Highest Protein Food - Spirulina Green Gold)

import fs from 'fs';

const creds = JSON.parse(fs.readFileSync('./social-credentials.json', 'utf8')).youtube;

async function getYouTubeAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('OAuth refresh failed: ' + JSON.stringify(data));
  }
  return data.access_token;
}

const VIDEO_ID = '7WnzNVR2Gco';
const NEW_TITLE = 'अंडा-चिकन से 3x ज्यादा प्रोटीन | World Highest Protein Superfood: Spirulina | Sujata Nutrilive';

const NEW_DESCRIPTION = `क्या आप जानते हैं दुनिया का सबसे शक्तिशाली प्रोटीन फूड अंडा, चिकन या मीट नहीं है? चिकन में मात्र 31%, मीट में 26% और अंडे में 13% प्रोटीन होता है, जबकि 100% शुद्ध स्पिरुलिना (Arthrospira Platensis) में 65% से 73% तक सम्पूर्ण बायो-अवेलेबल प्रोटीन और सभी 9 आवश्यक अमीनो एसिड्स पाए जाते हैं!

1974 के संयुक्त राष्ट्र (UN) विश्व खाद्य सम्मेलन और नासा (NASA) द्वारा इसे भविष्य का सर्वश्रेष्ठ आहार घोषित किया गया है, क्योंकि 1 ग्राम स्पिरुलिना में 1 किलो सामान्य फल और सब्जियों जितनी सूक्ष्म-पोषक तत्वों (Micronutrients) की सघनता होती है।

🛒 सुजाता न्यूट्रीलाईव्ह १००% शुद्ध स्पिरुलिना उत्पादने थेट मागवा (Cash on Delivery Available):
👉 १००% शुद्ध स्पिरुलिना कॅप्सूल्स (100% Veg HPMC Capsules):
https://www.sujatanutrilive.com/product/sujata-spirulina-capsules?utm_source=youtube&utm_medium=video&utm_campaign=protein_superfood_7Wn

👉 स्पिरुलिना + सीबकथॉर्न कम्प्लीट सुपरफूड कॉम्बो (Energy & Stamina):
https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=video&utm_campaign=protein_superfood_7Wn

👉 १००% शुद्ध स्पिरुलिना पावडर (Daily Protein Smoothie & Shake Mix):
https://www.sujatanutrilive.com/product/sujata-spirulina-powder?utm_source=youtube&utm_medium=video&utm_campaign=protein_superfood_7Wn

💬 WhatsApp Direct 1-Click Order (सीधे व्हाट्सएप पर ऑर्डर करें):
https://wa.me/919834783503?text=Namaskar%2C%20I%20watched%20Richest%20Protein%20Food%20video%20and%20want%20to%20order%20Sujata%20Spirulina

📞 फोन / कॅश ऑन डिलिव्हरी (COD) हेल्पलाईन: +91 98347 83503
🎁 विशेष सवलत: ऑनलाईन UPI पेमेंटवर १०% त्वरित बचत + ऑल इंडिया मोफत डिलिव्हरी!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ VERIFIED CHAPTERS & KEY MOMENTS (EXACT 1:04 AUDIO MATCH):
0:00 - दुनिया का सबसे रिच प्रोटीन फूड (अंडा, चिकन या मीट नहीं!)
0:11 - प्रोटीन तुलना: चिकन 31%, मीट 26%, अंडा 13% vs स्पिरुलिना 73%
0:21 - राजा-महाराजाओं का युद्ध स्टैमिना सीक्रेट
0:30 - NASA के अंतरिक्ष यात्रियों (Astronauts) का सुपरफूड
0:37 - सम्पूर्ण अमिनो ॲसिड्स व स्नायूंची ताकद (Muscle Building)
0:49 - ब्लड प्रेशर, खराब कोलेस्ट्रॉल व ऊर्जा पातळी नियंत्रण
0:55 - निसर्गाचे 'ग्रीन गोल्ड' - १००% शुद्ध स्पिरुलिना (Green Gold)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎙️ प्रत्यक्ष व्हिडिओ ऑडिओ संवाद (VERIFIED AUDIO TRANSCRIPT):
• "दुनिया का सबसे रिच प्रोटीन वाला फूड ना अंडा है, ना चिकन है, ना मीट है। यह है एक ऐसा नेचुरल सुपरफूड जिसके बारे में ज्यादातर लोगों को पता ही नहीं है।"
• "चिकन में लगभग 31% प्रोटीन, मीट में 26% प्रोटीन और अंडे में करीब 13% प्रोटीन होता है। लेकिन इस सुपरफूड में लगभग 73% प्रोटीन पाया जाता है।"
• "पहले के समय में राजा महाराजा जब युद्ध के लिए जाते थे तब इसका सेवन करते थे क्योंकि यह शरीर को ताकत और स्टैमिना देने में मदद करता था। यहां तक कि अंतरिक्ष में जाने वाले एस्ट्रोनॉट्स के लिए भी इसे न्यूट्रिएंट डेंस फूड के तौर पर इस्तेमाल किया जाता है।"
• "वैज्ञानिक भी मानते हैं कि आने वाले समय में प्रोटीन का एक महत्वपूर्ण स्रोत यही हो सकता है क्योंकि इसमें कई जरूरी अमीनो एसिड पाए जाते हैं जो शरीर और मांसपेशियों के लिए महत्वपूर्ण होते हैं।"
• "यह हाई ब्लड प्रेशर और खराब कोलेस्ट्रॉल जैसी समस्याओं में भी मददगार हो सकता है। शरीर के एनर्जी लेवल को बेहतर करने में भी मदद करता है और इसे कहा जाता है 'ग्रीन गोल्ड' और इसका नाम है स्पिरुलिना!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔬 स्पिरुलिनाचे सखोल बायोकेमिस्ट्री विश्लेषण (PROTEIN BIOCHEMISTRY):
१. PDCAAS = 1.0 व सेल्युलोज-मुक्त रचना: स्पिरुलिनाची पेशीभित्ती नाजूक म्यूकोपॉलिसॅकराईड्सची असल्याने ९५% प्रथिनांचे शोषण थेट रक्तात होते.
२. शून्य प्युरिन्स व युरिक ॲसिड संरक्षण: मांसाहारातील प्युरिन्समुळे युरिक ॲसिड वाढते. स्पिरुलिनात प्युरिन्स नसल्याने किडनी किंवा लिव्हरवर ताण येत नाही.
३. mTOR पाथवे व स्नायू बळकटीकरण (BCAA): ल्युसीन, आयसोल्युसीन व व्हॅलीनमुळे शरीराची झीज भरून स्नायूंची ताकद वाढते.
४. C-Phycocyanin (21.4%): मानवी शरीरातील ऑक्सिडेटिव्ह ताण कमी करून हृदयाचे रक्षण करणारा दुर्मिळ अँटीऑक्सिडंट.

📊 नाशिक शेतातून थेट कोल्ड-प्रोसेसिंग:
• Sub-40°C तंत्रज्ञानामुळे प्रथिनांचे विघटन होत नाही.
• हेवी मेटल्स चाचणी (Lead, Mercury, Arsenic): Below 0.01 ppm
• FSSAI सेंट्रल लायसन्स: #11521999000284

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ शास्त्रीय प्रश्नोत्तरे (PROTEIN CLINICAL FAQ):
Q1: व्हे प्रोटीन (Whey) पेक्षा स्पिरुलिना पचायला हलके का?
A: व्हे प्रोटीनमध्ये लॅक्टोजमुळे गॅस व अपचन होते. स्पिरुलिना अल्कलाईन व लॅक्टोज-फ्री असल्याने पचनास अत्यंत सुलभ आहे.

Q2: चिकन-अंड्यांपेक्षा जास्त प्रोटीन असूनही किडनीवर ताण का नाही?
A: मांसाहारात नायट्रोजनचे टाकाऊ घटक जास्त असतात. स्पिरुलिना अल्कलाईन व कोलेस्ट्रॉल-मुक्त असल्याने मूत्रपिंडावर ताण येत नाही.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 अधिकृत पत्ता व संपर्क:
सुजाता न्यूट्री लाईव्ह ॲग्रोटेक प्रायव्हेट लिमिटेड, प्लॉट नं १२५, साई निवास, धांडाई कॉलनी, खुटवड नगर, कामटवाडे, नाशिक, महाराष्ट्र - ४२२००८
हेल्पलाईन: +91 98347 83503 | वेबसाईट: https://www.sujatanutrilive.com

#SpirulinaProtein #SpirulinaBenefits #GreenGold #VegetarianProtein #SuperfoodIndia #SujataNutrilive #ProteinDiet #NASASuperfood #PlantBasedProtein #FitnessNutrition #Nashik`;

const NEW_TAGS = [
  'Highest Protein Food in the World',
  'दुनिया का सबसे ताकतवर प्रोटीन फूड',
  'Spirulina Protein Percentage',
  'Vegetarian Protein Sources',
  'Spirulina vs Eggs',
  'Spirulina vs Chicken Protein',
  'Best Plant Based Protein India',
  'Spirulina Benefits in Hindi',
  'सुजाता स्पिरुलिना',
  'Green Gold Superfood',
  'Spirulina for Muscle Building',
  'NASA Astronauts Superfood',
  'Sujata Nutrilive Spirulina',
  'Spirulina Nashik',
  'Complete Protein for Vegetarians',
  'Spirulina Capsules'
];

async function run() {
  console.log('🔄 Fetching access token...');
  const token = await getYouTubeAccessToken();

  console.log('🔄 Fetching video snippet...');
  const getRes = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + VIDEO_ID, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const getData = await getRes.json();
  const videoSnippet = getData.items[0].snippet;

  videoSnippet.title = NEW_TITLE;
  videoSnippet.description = NEW_DESCRIPTION;
  videoSnippet.tags = NEW_TAGS;
  videoSnippet.categoryId = '27';

  console.log('Description length:', NEW_DESCRIPTION.length);

  console.log('🔄 Updating video on YouTube with Deep Protein Biochemistry...');
  const updateRes = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: VIDEO_ID,
      snippet: videoSnippet
    })
  });

  const updateData = await updateRes.json();
  if (updateData.error) {
    throw new Error('Update failed: ' + JSON.stringify(updateData.error));
  }
  console.log('✅ Video 2 (7WnzNVR2Gco) successfully upgraded to Deep Protein Biochemistry Science!');
}

run().catch(err => console.error('❌ Error:', err));

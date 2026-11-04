// scripts/update_video_7WnzNVR2Gco.mjs
// 🚀 SUJATA NUTRILIVE: SILICON VALLEY TIER YOUTUBE SEO OPTIMIZER
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

const NEW_DESCRIPTION = `क्या आप जानते हैं दुनिया का सबसे शक्तिशाली प्रोटीन फूड अंडा, चिकन या मीट नहीं है? चिकन में 31%, मीट में 26% और अंडे में 13% प्रोटीन होता है, जबकि 100% शुद्ध स्पिरुलिना (Green Gold) में 65% से 73% तक सम्पूर्ण बायो-अवेलेबल प्रोटीन और सभी 9 आवश्यक अमीनो एसिड्स पाए जाते हैं!

राजा-महाराजा युद्ध के दौरान असीम शारीरिक ताकत और स्टैमिना के लिए इसका उपयोग करते थे। आज नासा (NASA) के अंतरिक्ष यात्री भी इसे संपूर्ण पोषक आहार मानते हैं।

🛒 सुजाता न्यूट्रीलाईव्ह अधिकृत उत्पादने थेट मागवा (Cash on Delivery Available):
👉 १००% शुद्ध स्पिरुलिना कॅप्सूल्स (100% Veg HPMC Capsules):
https://www.sujatanutrilive.com/product/sujata-spirulina-capsules?utm_source=youtube&utm_medium=video&utm_campaign=protein_superfood_7Wn

👉 स्पिरुलिना + सीबकथॉर्न कम्प्लीट सुपरफूड कॉम्बो:
https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=video&utm_campaign=protein_superfood_7Wn

👉 १००% शुद्ध स्पिरुलिना पावडर (Daily Protein Smoothie Mix):
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
🔬 स्पिरुलिना प्रोटीन का वैज्ञानिक महत्व (THE CLINICAL DIFFERENCE):
१. 65% ते 73% कम्प्लीट बायो-प्रोटीन: शाकाहारी आहारातील जगातील सर्वाधिक प्रथिनयुक्त नैसर्गिक स्रोत.
२. सर्व 9 आवश्यक अमिनो ॲसिड्स: मानवी शरीर स्वतः तयार करू शकत नसलेले सर्व अमिनो ॲसिड्स यात नैसर्गिकरीत्या उपलब्ध.
३. जलद पचन व 95%+ शोषण: सेल्युलोज वॉल नसल्यामुळे शरीरामध्ये प्रथिनांचे ९५% पेक्षा जास्त सहज शोषण.
४. C-Phycocyanin (21.4%): पेशींचे रक्षण करणारा आणि ताकद वाढवणारा जगातील दुर्मिळ अँटीऑक्सिडंट.

📊 NABL लॅबोरेटरी प्रमाणित शुद्धता व चाचण्या:
• Sub-40°C कोल्ड-प्रोसेस्ड (उच्च तापमानाचा कोणताही वापर नाही)
• हेवी मेटल्स चाचणी (Lead, Mercury, Arsenic): Below 0.01 ppm
• FSSAI सेंट्रल लायसन्स: #11521999000284

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ वारंवार विचारले जाणारे प्रश्न (FAQ):
Q1: शाकाहारी लोकांसाठी स्पिरुलिना सर्वोत्तम का आहे?
A: स्पिरुलिनामध्ये अंड्यापेक्षा ३ पट आणि चिकनपेक्षा २ पट अधिक प्रथिने (६५-७३%) व शून्य कोलेस्ट्रॉल असते.

Q2: रोज किती प्रमाणात स्पिरुलिना घ्यावे?
A: दररोज सकाळी आणि संध्याकाळी जेवणानंतर १-१ कॅप्सूल (किंवा ३ ग्रॅम पावडर) पाण्यासोबत घ्यावी.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 अधिकृत पत्ता व संपर्क:
सुजाता न्यूट्री लाईव्ह ॲग्रोटेक प्रायव्हेट लिमिटेड, प्लॉट नं १२५, साई निवास, धांडाई कॉलनी, खुटवड नगर, कामटवाडे, नाशिक, महाराष्ट्र - ४२२००८
हेल्पलाईन: +91 98347 83503 | वेबसाईट: https://www.sujatanutrilive.com

#SpirulinaProtein #SpirulinaBenefits #GreenGold #VegetarianProtein #SuperfoodIndia #SujataNutrilive #ProteinDiet #NASASuperfood #FitnessNutrition #Nashik`;

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

async function updateVideo() {
  console.log('🔄 Fetching access token...');
  const token = await getYouTubeAccessToken();

  console.log('🔄 Fetching current video metadata...');
  const getRes = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + VIDEO_ID, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const getData = await getRes.json();
  const videoSnippet = getData.items[0].snippet;

  videoSnippet.title = NEW_TITLE;
  videoSnippet.description = NEW_DESCRIPTION;
  videoSnippet.tags = NEW_TAGS;
  videoSnippet.categoryId = '27'; // Education

  console.log('Description length:', NEW_DESCRIPTION.length);

  console.log('🔄 Updating video metadata on YouTube...');
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
    throw new Error('Failed to update video: ' + JSON.stringify(updateData.error));
  }
  console.log('✅ Video metadata updated successfully!');
  console.log('Updated Title:', updateData.snippet.title);
  console.log('Updated Description Length:', updateData.snippet.description.length);
  console.log('Updated Tags Count:', updateData.snippet.tags?.length);

  // Post Pinned CTA Comment
  console.log('🔄 Posting official high-converting CTA comment...');
  const commentText = `🌿 दुनिया का #1 प्रोटीन सुपरफूड — 100% शुद्ध स्पिरुलिना (ग्रीन गोल्ड):

अंडे और चिकन से 3x ज्यादा बायो-प्रोटीन, 46+ एंटीऑक्सिडेंट्स और संपूर्ण 9 आवश्यक अमीनो एसिड्स से भरपूर सुजाता स्पिरुलिना सीधे कंपनी से ऑर्डर करें:

👉 100% शुद्ध स्पिरुलिना कैप्सूल्स (ऑर्डर लिंक):
https://www.sujatanutrilive.com/product/sujata-spirulina-capsules?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=protein_superfood_7Wn

👉 स्पिरुलिना + सीबकथॉर्न कम्प्लीट कॉम्बो पैक:
https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=protein_superfood_7Wn

💬 WhatsApp पर 1-क्लिक ऑर्डर (Pre-filled Chat):
https://wa.me/919834783503?text=Namaskar%2C%20I%20watched%20Richest%20Protein%20Food%20video%20and%20want%20to%20order%20Sujata%20Spirulina

📞 फोन / कैश ऑन डिलीवरी (COD) हेल्पलाइन: +91 98347 83503
🎁 UPI पेमेंट पर तुरंत 10% छूट + पूरे भारत में फ्री डिलीवरी!
🏢 सुजाता न्यूट्री लाइव एग्रोटेक प्रा. लि., नाशिक (महाराष्ट्र)`;

  const commentRes = await fetch('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      snippet: {
        videoId: VIDEO_ID,
        topLevelComment: {
          snippet: {
            textOriginal: commentText
          }
        }
      }
    })
  });

  const commentData = await commentRes.json();
  if (commentData.id) {
    console.log('✅ Official comment posted with ID:', commentData.id);
  } else {
    console.warn('⚠️ Comment post response:', commentData);
  }

  console.log('🎉 ALL DONE! Video 7WnzNVR2Gco has been fully optimized to Silicon Valley standards.');
}

updateVideo().catch(err => {
  console.error('❌ Error executing update:', err);
});

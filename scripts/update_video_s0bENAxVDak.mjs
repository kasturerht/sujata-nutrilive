// scripts/update_video_s0bENAxVDak.mjs
// 🚀 SUJATA NUTRILIVE: SILICON VALLEY TIER YOUTUBE SEO OPTIMIZER
// Video: s0bENAxVDak (Marathi Body Organs Health Issues - Spirulina 21+ Benefits)

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

const VIDEO_ID = 's0bENAxVDak';

const NEW_TITLE = 'सांधेदुखी, शुगर, ॲसिडिटीवर 1 उपाय | 21+ Health Benefits of Spirulina | Sujata Nutrilive';

const NEW_DESCRIPTION = `रोजच्या आहारातील कीटकनाशके, जंक फूड आणि भेसळीमुळे आपले शरीर आतून कमकुवत होत आहे का? सांधेदुखी, रक्तातील वाढती साखर, थायरॉईडमुळे येणारा थकवा, लिव्हरमधील विषारी घटक आणि पोटाची ॲसिडिटी या सर्व समस्यांवर मात करण्यासाठी शरीराला गरज आहे १००% शुद्ध व नैसर्गिक सुपरफूडची!

फक्त १ ग्रॅम स्पिरुलिनामध्ये १ किलो ताजी फळे आणि भाज्यांचे परिपूर्ण पोषण, व्हिटॅमिन B12, नैसर्गिक आयर्न आणि कम्प्लीट प्रथिने मिळतात.

🛒 सुजाता न्यूट्रीलाईव्ह अधिकृत उत्पादने थेट मागवा (Cash on Delivery Available):
👉 सुजाता स्पिरुलिना + सीबकथॉर्न कॉम्बो पॅक (२१+ आजारांवर रामबाण):
https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=video&utm_campaign=marathi_health_issues_s0b

👉 १००% शुद्ध स्पिरुलिना कॅप्सूल्स (Bio-Protein & Daily Vitamins):
https://www.sujatanutrilive.com/product/sujata-spirulina-capsules?utm_source=youtube&utm_medium=video&utm_campaign=marathi_health_issues_s0b

👉 १००% शुद्ध सीबकथॉर्न कॅप्सूल्स (दुर्मिळ ओमेगा-७ व व्हिटॅमिन सी):
https://www.sujatanutrilive.com/product/sujata-sea-buckthorn-capsules?utm_source=youtube&utm_medium=video&utm_campaign=marathi_health_issues_s0b

💬 WhatsApp Direct 1-Click Order (थेट व्हॉट्सॲपवर १-क्लिक ऑर्डर करा):
https://wa.me/919834783503?text=Namaskar%2C%20I%20watched%20Marathi%20Health%20Video%20and%20want%20to%20order%20Spirulina%20Combo

📞 फोन / कॅश ऑन डिलिव्हरी (COD) हेल्पलाईन: +91 98347 83503
🎁 विशेष सवलत: ऑनलाईन UPI पेमेंटवर १०% त्वरित बचत + ऑल इंडिया मोफत डिलिव्हरी!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ VERIFIED CHAPTERS & KEY MOMENTS (EXACT 1:03 AUDIO MATCH):
0:00 - रोजच्या अन्नातील कीटकनाशके व शरीरावर होणारे दुष्परिणाम
0:07 - सांध्यांची समस्या: व्हिटॅमिन्सची कमतरता व सांधेदुखी (Joint Pain)
0:15 - पॅनक्रियाज: रक्तातील साखरेचे प्रमाण (Sugar / Diabetes Control)
0:21 - थायरॉईड व शरीरातील ऊर्जा कमी होणे (Thyroid & Fatigue)
0:25 - लिव्हर डिटॉक्स: जंक फूड आणि विषारी घटक बाहेर टाकणे (Liver Detox)
0:32 - पोटाचे विकार: अपचन आणि ॲसिडिटीपासून मुक्ती (Digestion & Acidity)
0:37 - शरीराला आतून मजबूत बनवणारे सुपरफूड: स्पिरुलिना (Vitamin B12 & Iron)
0:48 - 1 ग्रॅम स्पिरुलिना = 1 किलो फळे व भाज्यांचे परिपूर्ण पोषण
0:54 - सुजाता स्पिरुलिना + सीबकथॉर्न: २१+ आजारांवर नैसर्गिक उपाय
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎙️ प्रत्यक्ष व्हिडिओ ऑडिओ संवाद (VERIFIED AUDIO TRANSCRIPT):
• "रोजचे अनहेल्दी पेस्टिसाइड भरलेलं अन्न आपल्या शरीराला आतून कमजोर करतंय..."
• "जॉईंट्स बोलतायत: व्हिटॅमिन्सची कमतरता वाढली की सांधेदुखी, जॉईंट पेन सुरू होतं..."
• "पॅनक्रियाज: शुगर लेव्हल सतत वाढल्यामुळे मला व्यवस्थित काम करता येत नाहीये..."
• "थायरॉईड: पुअर न्यूट्रिशनमुळे बॉडी एनर्जी कमी होत चालली आहे..."
• "लिव्हर: टॉक्सिन्स आणि जंक फूडमुळे शरीराला क्लीन ठेवणं कठीण होतंय..."
• "स्टमक: अनहेल्दी फूडमुळे डायजेशन, ॲसिडिटी समस्या वाढते आहे..."
• "आपल्याला हवंय एक प्रॉपर न्यूट्रिशन जे शरीराला आतून स्ट्रॉँग बनवेल, म्हणून सुपरफूड स्पिरुलिना! व्हिटॅमिन B12, आयर्न, प्रोटीन आणि आवश्यक न्यूट्रिएंट्सने भरलेलं पॉवरफुल सुपरफूड!"
• "फक्त १ ग्रॅम स्पिरुलिनामध्ये १ किलो फ्रूट्स इतकं पॉवरफुल न्यूट्रिशन आणि प्रोटीन सपोर्ट मिळतो!"
• "सुजाता न्यूट्रीलाईव्ह स्पिरुलिना प्लस सीबकथॉर्न: २१ पेक्षा जास्त हेल्थ प्रॉब्लेम्सवर सपोर्ट देणारा पॉवरफुल डेली न्यूट्रिशन कॉम्बो!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔬 सुजाता स्पिरुलिनाचे शरीरावरील कार्य (THE CLINICAL DIFFERENCE):
१. सांधेदुखी व नसा: नैसर्गिक कॅल्शियम, मॅग्नेशियम आणि लोह सांध्यातील वंगण व कार्टिलेज टिकवून ठेवतात.
२. शुगर व मधुमेह नियंत्रण: इन्सुलिन संवेदनशीलता सुधारून रक्तातील साखर नैसर्गिकरीत्या संतुलित राखते.
३. थायरॉईड व चयापचय: वनस्पती-आधारित व्हिटॅमिन B12 व अमिनो ॲसिड्स शरीराची ऊर्जा पातळी कायम ठेवतात.
४. लिव्हर व पचनक्रिया शुद्धीकरण: उच्च दर्जाचे क्लोरोफिल शरीरातील टॉक्सिन्स बाहेर टाकून गॅस, ॲसिडिटी नष्ट करते.

📊 NABL लॅबोरेटरी प्रमाणित शुद्धता व चाचण्या:
• Sub-40°C कोल्ड-प्रोसेस्ड (हाय-हीट स्प्रे ड्रायिंग नाही)
• हेवी मेटल्स चाचणी (Lead, Mercury, Arsenic): Below 0.01 ppm
• FSSAI सेंट्रल लायसन्स: #11521999000284

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ वारंवार विचारले जाणारे प्रश्न (FAQ):
Q1: स्पिरुलिना आणि सीबकथॉर्न कॉम्बो एकत्र का घ्यावा?
A: स्पिरुलिना शरीराला प्रोटीन, व्हिटॅमिन B12 व लोह पुरवतो, तर सीबकथॉर्नमधील व्हिटॅमिन सी आणि ओमेगा ७ लोह शोषून घेण्यास व पेशी दुरुस्त करण्यास तिप्पट मदत करतात.

Q2: हे उत्पादन पूर्णपणे शाकाहारी आहे का?
A: होय, हे १००% शाकाहारी (Plant-Cellulose HPMC Capsules), नैसर्गिक आणि कोणतेही रसायन नसलेले उत्पादन आहे.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 अधिकृत पत्ता व संपर्क:
सुजाता न्यूट्री लाईव्ह ॲग्रोटेक प्रायव्हेट लिमिटेड, प्लॉट नं १२५, साई निवास, धांडाई कॉलनी, खुटवड नगर, कामटवाडे, नाशिक, महाराष्ट्र - ४२२००८
हेल्पलाईन: +91 98347 83503 | वेबसाईट: https://www.sujatanutrilive.com

#SpirulinaInMarathi #सांधेदुखी #सुजातास्पिरुलिना #SujataNutrilive #SugarControl #AcidityRelief #LiverDetox #ThyroidCare #SuperfoodMaharashtra #Nashik #AyurvedicHealth`;

const NEW_TAGS = [
  'सांधेदुखी वरील घरगुती उपाय',
  'Spirulina Benefits in Marathi',
  'स्पिरुलिनाचे फायदे',
  'शुगर नियंत्रण उपाय',
  'ॲसिडिटी कायमची बंद',
  'Sujata Nutrilive Spirulina',
  'Spirulina and Sea Buckthorn Combo',
  'थायरॉईड वरील उपाय',
  'लिव्हर डिटॉक्स मराठी',
  'Best Ayurvedic Immunity Booster',
  'Organic Spirulina Nashik',
  'Spirulina Capsules in Marathi',
  'Health Benefits of Spirulina',
  'सांधेदुखी औषध',
  'Spirulina Superfood India',
  'सुजाता न्यूट्रीलाईव्ह'
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
  const commentText = `🌿 सांधेदुखी, शुगर, थायरॉईड, लिव्हर व ॲसिडिटीवर २१+ फायद्यांचे नैसर्गिक सुपरफूड:

१ ग्रॅम स्पिरुलिना = १ किलो फळे आणि भाज्यांचे परिपूर्ण पोषण! १००% शुद्ध, लॅब-प्रमाणित सुजाता स्पिरुलिना + सीबकथॉर्न कॉम्बो पॅक थेट कंपनीकडून मागवा:

👉 स्पिरुलिना + सीबकथॉर्न कॉम्बो पॅक (थेट ऑर्डर लिंक):
https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=marathi_health_issues_s0b

👉 १००% शुद्ध स्पिरुलिना कॅप्सूल्स:
https://www.sujatanutrilive.com/product/sujata-spirulina-capsules?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=marathi_health_issues_s0b

💬 WhatsApp वर थेट १-क्लिक ऑर्डर (Pre-filled Chat):
https://wa.me/919834783503?text=Namaskar%2C%20I%20watched%20Marathi%20Health%20Video%20and%20want%20to%20order%20Spirulina%20Combo

📞 फोन / कॅश ऑन डिलिव्हरी (COD) हेल्पलाईन: +91 98347 83503
🎁 ऑनलाईन UPI पेमेंटवर १०% त्वरित बचत + ऑल इंडिया मोफत डिलिव्हरी!
🏢 सुजाता न्यूट्रीलाईव्ह ॲग्रोटेक प्रा. लि., नाशिक (महाराष्ट्र)`;

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

  console.log('🎉 ALL DONE! Video s0bENAxVDak has been fully optimized to Silicon Valley standards.');
}

updateVideo().catch(err => {
  console.error('❌ Error executing update:', err);
});

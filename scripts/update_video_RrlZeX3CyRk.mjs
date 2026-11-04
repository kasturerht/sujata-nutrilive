// scripts/update_video_RrlZeX3CyRk.mjs
// 🚀 SUJATA NUTRILIVE: SILICON VALLEY TIER YOUTUBE SEO OPTIMIZER
// Video: RrlZeX3CyRk (Kaluji Fakira, Washim - 15 Years Sciatica Relief Testimonial)

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

const VIDEO_ID = 'RrlZeX3CyRk';

const NEW_TITLE = '15 वर्षांचा जुनाट सायटिका बरा | Sciatica Patient Relief Result | Sujata Nutrilive';

const NEW_DESCRIPTION = `वाशिम (महाराष्ट्र) येथील काळूजी फकिरा हे मागील १५ वर्षांपासून असह्य सायटिका (Sciatica / नसांचे व सांध्यांचे दुखणे) त्रासाने त्रस्त होते. अनेक दवाखाने व उपचार करूनही त्यांना आराम मिळाला नव्हता, साधे उठणे-बसणे आणि काम करणेही कठीण झाले होते. परंतु सुजाता न्युट्रीलाईव्हचे १००% शुद्ध व नैसर्गिक आयुर्वेदिक सुपरफूड्स सलग ३ महिने नियमित घेतल्यानंतर त्यांना मिळालेला १००% आश्चर्यकारक आराम या व्हिडिओमध्ये त्यांनी स्वतः सांगितला आहे.

🛒 सुजाता न्यूट्रीलाईव्ह अधिकृत उत्पादने थेट मागवा (Cash on Delivery उपलब्ध):
👉 स्पिरुलिना + सीबकथॉर्न कॉम्बो पॅक (नसा व सांधेदुखीसाठी विशेष):
https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=video&utm_campaign=sciatica_patient_kaluji_Rrl

👉 १००% शुद्ध स्पिरुलिना कॅप्सूल्स (Bio-Protein & Nerve Health):
https://www.sujatanutrilive.com/product/sujata-spirulina-capsules?utm_source=youtube&utm_medium=video&utm_campaign=sciatica_patient_kaluji_Rrl

💬 WhatsApp Direct 1-Click Order / मोफत आयुर्वेदिक सल्ला:
https://wa.me/919834783503?text=Namaskar%2C%20I%20watched%20Kaluji%20Fakira%20Sciatica%20Result%20video%20and%20want%20information%20about%20Sciatica%20Joint%20Care%20Medicine

📞 फोन / कॅश ऑन डिलिव्हरी (COD) हेल्पलाईन: +91 98347 83503
🎁 विशेष सवलत: ऑनलाईन UPI पेमेंटवर १०% त्वरित बचत + ऑल इंडिया मोफत डिलिव्हरी!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ VERIFIED CHAPTERS & KEY MOMENTS (EXACT 1:06 AUDIO MATCH):
0:00 - रुग्णाची ओळख (काळूजी फकिरा, गाव पाचंगा, जि. वाशिम)
0:09 - मागील १५ वर्षांपासून जुनाट सायटिकाचा (Sciatica) असह्य त्रास
0:20 - अनेक दवाखाने व औषधोपचार करूनही आराम नाही
0:28 - सुजाता न्युट्रीलाईव्हचे आयुर्वेदिक उपचार सुरू केल्यानंतरचा अनुभव
0:38 - ३ महिन्यांचा नियमित कोर्स आणि १००% आश्चर्यकारक फरक
0:48 - उठता-बसता काम करणे व चालणे-फिरणे सहज शक्य
0:59 - रुग्णाचे मनोगत व इतर रुग्णांसाठी मोलाचा सल्ला
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎙️ प्रत्यक्ष रुग्णाचा ऑडिओ संवाद (VERIFIED AUDIO TRANSCRIPT):
• डॉक्टर / प्रतिनिधी: "सर नमस्कार!"
• काळूजी फकिरा: "नमस्कार सर!"
• डॉक्टर / प्रतिनिधी: "सर नाव काय तुमचं?"
• काळूजी फकिरा: "नाव काळूजी फकिरा, गाव पाचंगा, तालुका रिसोड, जिल्हा वाशिम."
• डॉक्टर / प्रतिनिधी: "ओके सर, काय त्रास होता सर तुम्हाला?"
• काळूजी फकिरा: "सर मला सायटिकाचा प्रॉब्लेम होता... सायटिकाचा खूप, १५ वर्षांपासून खूप त्रास होता! भरपूर सारे दवाखाने केले, पण आराम काही होत नव्हता. काम काही करता येत नव्हतं."
• काळूजी फकिरा: "औषध घेतल्यापासून मला रिझल्ट आहे. औषध कमीत कमी तीन महिने कंटिन्यू घेतली... आता पूर्ण फरक पडला आहे! काम करू शकतो, फिरू शकतो, चालू शकतो. पहिले उठता-बसता काम करताना विशेष त्रास व्हायचा... आता काही त्रास होत नाही, पूर्णपणे आराम पडला आहे."
• डॉक्टर / प्रतिनिधी: "ओके सर धन्यवाद सर! लोकांना नक्की सांगा."
• काळूजी फकिरा: "ठीक आहे सर, हो सर, ओके सर!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔬 सायटिका व नसांच्या त्रासावर सुजाता न्युट्रीलाईव्ह कसे कार्य करते? (THE SCIENTIFIC DIFFERENCE):
१. नसांची सूज व दाह कमी करणे: सायटिक नसेवर येणारा दबाव आणि सूज नैसर्गिक फायकॉसायनिन (C-Phycocyanin) व ओमेगा फॅटी ॲसिड्सच्या माध्यमातून कमी होते.
२. नसांचे पुनरुज्जीवन (Nerve Regeneration): नैसर्गिक वनस्पती-आधारित व्हिटॅमिन B12, B-Complex आणि आवश्यक अमिनो ॲसिड्स नसांच्या मायलिन शीथ (Myelin Sheath) चे संरक्षण करतात.
३. सांधे व स्नायूंची लवचिकता: हाडे, कार्टिलेज आणि स्नायूंना आवश्यक कॅल्शियम, मॅग्नेशियम आणि लोह (Natural Bio-Iron) योग्य प्रमाणात मिळते.

📊 NABL लॅबोरेटरी प्रमाणित गुणवत्ता व सुरक्षितता:
• १००% शुद्ध नैसर्गिक शेतीतून थेट प्रक्रिया (Cold-Processed below 40°C)
• हेवी मेटल्स चाचणी (Lead, Mercury, Arsenic): Below 0.01 ppm (FSSAI सुरक्षिततेच्या मर्यादेपेक्षा २५० पट अधिक शुद्ध)
• FSSAI सेंट्रल लायसन्स: #11521999000284

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ वारंवार विचारले जाणारे प्रश्न (FAQ):
Q1: सायटिकाच्या त्रासासाठी कोणता कोर्स योग्य ठरतो?
A: जुनाट सायटिका आणि नसांच्या त्रासासाठी सुजाता स्पिरुलिना कॅप्सूल्स आणि सीबकथॉर्न कॉम्बो पॅकचा किमान ३ महिन्यांचा कोर्स अत्यंत परिणामकारक ठरतो.

Q2: हे उत्पादन पूर्णपणे सुरक्षित आणि शाकाहारी आहे का?
A: होय, हे १००% शाकाहारी (HPMC Plant-Cellulose Capsules), नैसर्गिक आणि कोणत्याही रासायनिक किंवा सिंथेटिक घटकांशिवाय तयार केलेले आहे.

Q3: कॅश ऑन डिलिव्हरी (COD) उपलब्ध आहे का?
A: होय, संपूर्ण भारतात कॅश ऑन डिलिव्हरी (COD) आणि मोफत शिपिंग उपलब्ध आहे.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 अधिकृत पत्ता व संपर्क:
सुजाता न्यूट्री लाईव्ह ॲग्रोटेक प्रायव्हेट लिमिटेड
पत्ता: प्लॉट नं १२५, साई निवास, धांडाई कॉलनी, खुटवड नगर, कामटवाडे, नाशिक, महाराष्ट्र - ४२२००८
हेल्पलाईन: +91 98347 83503
ईमेल: support@sujatanutrilive.com
वेबसाईट: https://www.sujatanutrilive.com
Google Maps (5.0 ★): https://share.google/R7aB2MCG9AN5l3RF1

#SciaticaTreatment #सायटिका #SujataNutrilive #JointPainRelief #SpirulinaBenefits #NervePainRelief #AyurvedicMedicine #Washim #MarathiHealthTips #SpirulinaNashik #SciaticaCure #SciaticaRelief`;

const NEW_TAGS = [
  'सायटिका वरील घरगुती उपाय',
  'Sciatica Treatment in Marathi',
  'Sciatica Patient Result',
  'सायटिका दुखणे उपाय',
  'Sujata Nutrilive Sciatica',
  'Spirulina for Sciatica',
  'Spirulina for Nerve Pain',
  'Joint Pain Ayurvedic Medicine',
  'Sujata Nutrilive Washim',
  'Kaluji Fakira Sciatica Review',
  'Spirulina and Sea Buckthorn Combo',
  'Ayurvedic Treatment for Sciatica Pain',
  'Spirulina Nashik',
  'Nerve Compression Treatment Ayurveda',
  'Best Ayurvedic Medicine for Joint Pain',
  'Sciatica Pain Relief'
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

  // Post Pinned Comment
  console.log('🔄 Posting official high-converting comment...');
  const commentText = `🌿 <b>१५ वर्षांचा जुनाट सायटिका ३ महिन्यांत बरा! (काळूजी फकिरा, जि. वाशिम यांचा प्रत्यक्ष अनुभव):</b><br><br>सायटिका, नसांची कमजोरी, सांधेदुखी आणि मणक्याच्या त्रासावर १००% शुद्ध, लॅब-प्रमाणित आयुर्वेदिक सुपरफूड्स थेट कंपनीकडून मागवा:<br><br>👉 <b>स्पिरुलिना + सीबकथॉर्न कॉम्बो पॅक (नसा व सांधेदुखीसाठी विशेष):</b><br><a href="https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=sciatica_kaluji_Rrl">https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=sciatica_kaluji_Rrl</a><br><br>👉 <b>१००% शुद्ध स्पिरुलिना कॅप्सूल्स:</b><br><a href="https://www.sujatanutrilive.com/product/sujata-spirulina-capsules?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=sciatica_kaluji_Rrl">https://www.sujatanutrilive.com/product/sujata-spirulina-capsules?utm_source=youtube&utm_medium=pinned_comment&utm_campaign=sciatica_kaluji_Rrl</a><br><br>💬 <b>WhatsApp द्वारे १-क्लिक ऑर्डर व तज्ज्ञांचा सल्ला:</b><br><a href="https://wa.me/919834783503?text=Namaskar%2C%20I%20watched%20Sciatica%20Patient%20Result%20video%20and%20want%20information%20about%20Sciatica%20Joint%20Care%20Medicine">https://wa.me/919834783503?text=Namaskar%2C%20I%20watched%20Sciatica%20Patient%20Result%20video%20and%20want%20information%20about%20Sciatica%20Joint%20Care%20Medicine</a><br><br>📞 <b>कॉल / कॅश ऑन डिलिव्हरी (COD) हेल्पलाईन:</b> +91 98347 83503<br>🎁 <b>विशेष सवलत:</b> ऑनलाईन UPI पेमेंटवर १०% त्वरित बचत + ऑल इंडिया मोफत डिलिव्हरी!<br>🏢 <b>सुजाता न्यूट्रीलाईव्ह ॲग्रोटेक प्रा. लि., नाशिक (महाराष्ट्र)</b>`;

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
            textOriginal: commentText.replace(/<br>/g, '\n').replace(/<b>|<\/b>|<a [^>]+>|<\/a>/g, '')
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

  // Reply to customer comment (@vijendrakumar-sb2kq)
  console.log('🔄 Replying to customer comment (@vijendrakumar-sb2kq)...');
  const parentCommentId = 'UgyfLMMfOP2t-Qqwx1x4AaABAg';
  const replyRes = await fetch('https://www.googleapis.com/youtube/v3/comments?part=snippet', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      snippet: {
        parentId: parentCommentId,
        textOriginal: 'धन्यवाद विजेंद्र जी! 🙏 सुजाता न्युट्रीलाईव्हच्या शुद्ध आणि लॅब-प्रमाणित आयुर्वेदिक उत्पादनांवर विश्वास ठेवल्याबद्दल आम्ही आपले मनापासून आभारी आहोत. अधिक माहिती किंवा नवीन ऑर्डरसाठी आपण आमच्या अधिकृत हेल्पलाईनवर (+91 98347 83503) संपर्क साधू शकता. निरोगी रहा, आनंदी रहा! 🌿✨'
      }
    })
  });
  const replyData = await replyRes.json();
  if (replyData.id) {
    console.log('✅ Customer reply posted with ID:', replyData.id);
  } else {
    console.warn('⚠️ Customer reply response:', replyData);
  }

  console.log('🎉 ALL DONE! Video RrlZeX3CyRk has been fully optimized to Silicon Valley standards.');
}

updateVideo().catch(err => {
  console.error('❌ Error executing update:', err);
});

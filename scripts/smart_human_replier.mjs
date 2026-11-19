import fs from 'fs';

// Load environment variables
const env = {};
if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      env[trimmed.slice(0, idx).trim()] = val;
    }
  });
}

const pageToken = env.META_PAGE_ACCESS_TOKEN;
const pageId = env.META_PAGE_ID || '356279144243520';

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Random integer between min and max (inclusive)
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Smart Language Detector
function detectLanguage(text) {
  const t = (text || '').toLowerCase();
  const hasDevanagari = /[\u0900-\u097F]/.test(t);

  const marathiWords = [
    'आहे', 'का', 'मिळाल', 'नाही', 'कमेंट', 'किंमत', 'कुठे', 'कशी', 'सांगा', 'छान', 'भाजी', 'भाकरी', 
    'खायची', 'घ्यायचे', 'कोणी', 'पथ्ये', 'दहा', 'हजार', 'शेती', 'निसर्ग', 'माझ्या', 'केसांसाठी', 
    'वापरत', 'ठरलंय', 'धन्यवाद', 'दादा', 'भाऊ', 'नका', 'करा', 'पाहिजे', 'घेतोस', 'दिसतोस', 
    'लपवता', 'कारण', 'काय', 'तुझ', 'मिळेल', 'माहिती', 'देणे', 'तपशील',
    'aahe', 'ahe', 'cha', 'chi', 'che', 'ghene', 'jaruri', 'kiti', 'kothe', 'kashi', 'sanga', 
    'tula', 'mala', 'tumcha', 'aamcha', 'kela', 'pahije', 'kuthe', 'kay', 'zala', 'nahi', 
    'parsal', 'milal', 'milale', 'ghyave', 'ghyava'
  ];

  const hindiWords = [
    'hai', 'kya', 'kimat', 'kitna', 'mene', 'khayi', 'bahot', 'badhiya', 'bhi', 'batao', 'aur', 
    'chahiye', 'kaise', 'hota', 'koi', 'sakta', 'paas', 'batakr', 'ye', 'kare', 'sakte', 'bhai',
    'bhejo', 'milega', 'lagta', 'khana', 'khayi', 'pata', 'hai kya',
    'है', 'क्या', 'कीमत', 'कितना', 'मैंने', 'बहुत', 'बढ़िया', 'भी', 'बताओ', 'और', 'चाहिए', 
    'कैसे', 'होता', 'सकता', 'सकते', 'पास', 'खाई', 'पता', 'कहाँ', 'मिलेगा', 'भेजें', 'भेजो'
  ];

  const englishWords = [
    'price', 'cost', 'how', 'what', 'where', 'when', 'details', 'doctor', 'advice', 'parcel', 
    'received', 'not', 'got', 'order', 'call', 'number', 'certified', 'distributor', 'franchise', 
    'macros', 'protein', 'discount', 'ingredients', 'b2b', 'collab', 'collaboration', 'proposal',
    'support', 'shipment', 'tracking', 'mlm', 'traditional'
  ];

  let mCount = 0;
  let hCount = 0;
  let eCount = 0;

  marathiWords.forEach(w => { if (t.includes(w)) mCount += 2; });
  hindiWords.forEach(w => { if (t.includes(w)) hCount += 2; });
  englishWords.forEach(w => { if (t.includes(w)) eCount += 1.5; });

  if (hasDevanagari) {
    if (mCount >= hCount) return 'mr';
    return 'hi';
  }

  if (t === 'pp' || t === 'price' || t === 'cost') return 'mr';

  if (mCount > hCount && mCount > eCount) return 'mr';
  if (hCount > mCount && hCount > eCount) return 'hi';
  return 'en';
}

// Smart Dynamic Reply Generator
function generateSmartReply(commentText, author = '', channel = 'ad') {
  const lang = detectLanguage(commentText);
  const lower = (commentText || '').toLowerCase().trim();

  // 1. Phone number lead
  if (/^\d{10}$/.test(lower.replace(/[\s\-\+]/g, '')) || lower.includes('9137805402') || lower.includes('9320993142')) {
    return `धन्यवाद! 🙏 आपला संपर्क क्रमांक मिळाला आहे. सुजाता न्यूट्रीलाईव्हची अधिकृत वेलनेस टीम आपल्याला थेट WhatsApp वर संपूर्ण माहिती आणि चालू स्पेशल डिस्काउंट ऑफर पाठवत आहे. काही अडचण असल्यास आपणही संपर्क करू शकता: 9834783503 🌿`;
  }

  // 2. MLM inquiry
  if (lower.includes('mlm') || lower.includes('traditional')) {
    return `Hello! 🌿 Sujata Nutrilive is a 100% traditional Direct-to-Consumer (D2C) brand and direct manufacturer based in Nashik, Maharashtra. We are NOT an MLM company. All products are manufactured in our own facility, rigorously NABL lab-tested, and sold directly to customers via our website. For authorized dealership or bulk procurement, please connect on WhatsApp: +91 9834783503. Thank you!`;
  }

  // 3. Gulab Jal / Non-product
  if (lower.includes('gulab') || lower.includes('गुलाब')) {
    return `नमस्ते! 🙏 हम केवल 100% शुद्ध स्पिरुलिना और सी-बकथॉर्न आधारित प्राकृतिक सुपरफूड्स बनाते हैं। गुलाब जल हमारे पास उपलब्ध नहीं है। स्वास्थ्य सप्लीमेंट्स की जानकारी के लिए WhatsApp करें: 9834783503. धन्यवाद! 🌿`;
  }

  // 4. Collaboration / Paid Promo
  if (lower.includes('collaboration') || lower.includes('collab') || lower.includes('proposal') || lower.includes('paid promotion')) {
    return `Hello! 🌿 Thank you for reaching out. Please share your collaboration proposal along with your media kit and analytics directly via DM or email us at sujatanutrilive@gmail.com. Our marketing team will review it.`;
  }

  // 5. Parcel complaint
  if (lower.includes('पार्सल') || lower.includes('मिळाल नाही') || lower.includes('parcel') || lower.includes('not received') || lower.includes('delivery')) {
    if (lang === 'mr') {
      return pick([
        `नमस्कार सर! 🙏 पार्सल मिळण्यास विलंब झाल्याबद्दल आम्ही मनापासून दिलगीर आहोत. कृपया आपला ऑर्डर नंबर किंवा ज्या फोन नंबरवरून ऑर्डर केली होती तो नंबर आम्हाला येथे इनबॉक्स करा किंवा थेट 9834783503 वर WhatsApp करा. आम्ही लगेच पोस्ट ऑफिस ट्रॅकिंग काढून तुमचे पार्सल आजच्या आज ट्रॅक करून देतो!`,
        `नमस्कार! पार्सल अजून न मिळाल्याबद्दल क्षमस्व. 🙏 काळजी करू नका, कृपया आपला फोन नंबर किंवा ऑर्डर तपशील 9834783503 वर WhatsApp करा किंवा येथे इनबॉक्स करा. आमची डिस्पॅच टीम लगेच ट्रॅकिंग माहिती देईल!`
      ]);
    } else if (lang === 'hi') {
      return `नमस्ते सर! 🙏 पार्सल मिलने में हुई देरी के लिए हमें बेहद खेद है। कृपया अपना आर्डर नंबर या फ़ोन नंबर हमें यहाँ इनबॉक्स करें या तुरंत 9834783503 पर WhatsApp करें। हम अभी पोस्ट ऑफिस ट्रैकिंग चेक करके आपका पार्सल तुरंत ट्रैक करवा देते हैं।`;
    } else {
      return `Hello! We sincerely apologize for the delivery delay. Please DM us your Order ID or phone number, or WhatsApp us directly at +91 9834783503. Our dispatch team will immediately check the postal tracking and update you! 🌿`;
    }
  }

  // 6. Doctor advice
  if (lower.includes('doctor') || lower.includes('डॉक्टर') || lower.includes('advice') || lower.includes('सल्ला')) {
    if (lang === 'mr') {
      return pick([
        `नमस्कार! 🌿 सुजाता स्पिरुलिना हे १००% नैसर्गिक आणि वनस्पतीजन्य सुपरफूड (फूड सप्लिमेंट) आहे, कोणतेही केमिकल किंवा कृत्रिम औषध नाही. त्यामुळे सामान्यतः अशक्तपणा, थकवा किंवा दैनंदिन पोषणासाठी हे थेट घेऊ शकता; यासाठी डॉक्टरांच्या प्रिस्क्रिप्शनची गरज नसते. पण जर आपल्याला आधीच गंभीर आजार किंवा नियमित औषधे सुरू असतील, तर फॅमिली डॉक्टरांचा सल्ला नक्की घेऊ शकता. अधिक मोफत माहितीसाठी WhatsApp करा: 9834783503!`,
        `नमस्कार! 🌿 स्पिरुलिना हे हिरव्या शेवाळापासून तयार केलेले १००% नैसर्गिक सुपरफूड आहे (FSSAI प्रमाणित आहारपूरक). हे भाजीपाल्यासारखे शुद्ध पोषक अन्न असल्याने सामान्य व्यक्ती नियमित घेऊ शकतात. जर आधीच एखादा वैद्यकीय उपचार सुरू असेल, तर डॉक्टरांचे मार्गदर्शन घेणे कधीही चांगले. अधिक माहितीसाठी WhatsApp: 9834783503.`
      ]);
    } else if (lang === 'hi') {
      return `नमस्ते! 🌿 सुजाता स्पिरुलिना 100% प्राकृतिक सुपरफूड (फ़ूड सप्लीमेंट) है, कोई रासायनिक दवा नहीं। सामान्य स्वास्थ्य, कमज़ोरी और पोषण के लिए इसे बिना किसी डॉक्टर की पर्ची के लिया जा सकता है। लेकिन यदि आपका पहले से कोई गंभीर इलाज चल रहा हो, तो डॉक्टर की सलाह लेना बेहतर रहता है। अधिक जानकारी के लिए WhatsApp करें: 9834783503.`;
    } else {
      return `Hello! 🌿 Sujata Spirulina is a 100% natural whole-food supplement (licensed by FSSAI), not a synthetic pharmaceutical drug. Healthy individuals can take it daily without a prescription for energy, immunity, and plant protein. However, if you have a preexisting medical condition, consulting your healthcare provider is always advisable. For free consultation, WhatsApp us: 9834783503.`;
    }
  }

  // 7. Macros & Nutritional Details
  if (lower.includes('macro') || lower.includes('nutrition') || lower.includes('protein kitna')) {
    if (lang === 'hi') {
      return `नमस्ते! 🌿 सुजाता नेचुरल स्पिरुलिना में लगभग 65% से 70% बायोअवेलेबल प्लांट प्रोटीन होता है। इसमें सभी 18 आवश्यक अमीनो एसिड्स, विटामिन B12, आयरन और बीटा-कैरोटीन भरपूर मात्रा में हैं, और फैट शून्य है। पूरी NABL सर्टिफाइड न्यूट्रिशनल रिपोर्ट देखने के लिए विजिट करें: https://www.sujatanutrilive.com या WhatsApp करें: 9834783503!`;
    } else if (lang === 'mr') {
      return `नमस्कार! 🌿 सुजाता नॅचरल स्पिरुलिनामध्ये तब्बल ६५% ते ७०% नैसर्गिक प्लांट प्रोटीन असते. यात सर्व १८ आवश्यक अमिनो अ‍ॅसिड्स, व्हिटॅमिन B12, आयर्न आणि अँटीऑक्सिडंट्स मुबलक प्रमाणात आहेत. संपूर्ण NABL प्रमाणित पोषणमूल्य रिपोर्ट पाहण्यासाठी भेट द्या: https://www.sujatanutrilive.com किंवा WhatsApp करा: 9834783503!`;
    } else {
      return `Hello! 🌿 Sujata Natural Spirulina packs 65-70% bioavailable plant protein per serving with zero cholesterol and minimal carbs. It is naturally rich in Vitamin B12, Iron, Beta-Carotene, and 18 essential amino acids. For our complete NABL lab-certified nutrition certificate, visit https://www.sujatanutrilive.com or WhatsApp: +91 9834783503!`;
    }
  }

  // 8. Discounts / Voucher codes
  if (lower.includes('discount') || lower.includes('code') || lower.includes('coupon') || lower.includes('offer')) {
    if (lang === 'mr') {
      return `नमस्कार! 🌿 सध्या आमच्या वेबसाइटवर १ महिन्याच्या डेली हेल्थ कॉम्बोवर (स्पिरुलिना १२० टॅब्लेट + सी-बकथॉर्न ६० कॅप्सूल) खास डिस्काउंट ऑफर सुरू आहे – संपूर्ण कॉम्बो फक्त ₹९५० मध्ये मोफत डिलिव्हरी व COD सह मिळेल! चालू डिस्काउंट कूपनसाठी थेट https://www.sujatanutrilive.com ला भेट द्या किंवा WhatsApp करा: 9834783503.`;
    } else if (lang === 'hi') {
      return `नमस्ते! 🌿 जी हाँ, वर्तमान में हमारे 1 महीने के हेल्थ कॉम्बो (स्पिरुलिना 120 टैबलेट + सी-बकथॉर्न 60 कैप्सूल) पर स्पेशल ऑफर चल रहा है – सिर्फ ₹950 में फ्री होम डिलीवरी और COD! आज का स्पेशल डिस्काउंट वाउचर जानने के लिए WhatsApp करें: 9834783503 या वेबसाइट देखें: https://www.sujatanutrilive.com`;
    } else {
      return `Hello! 🌿 Yes, we are running an exclusive discount on our 1-Month Daily Health Combo (Spirulina 120 Tablets + Sea Buckthorn 60 Capsules) at just ₹950 with Free Delivery & COD across India! Check active website offers at https://www.sujatanutrilive.com or WhatsApp us at +91 9834783503!`;
    }
  }

  // 9. City Availability
  if (lower.includes('ahmedabad') || lower.includes('kolhapur') || lower.includes('parbhani') || lower.includes('नाशिक मध्ये कुठे') || lower.includes('कुठे मिळेल')) {
    if (lang === 'mr') {
      return pick([
        `नमस्कार! 🌿 सुजाता न्यूट्रीलाईव्ह संपूर्ण महाराष्ट्रात आणि भारतात प्रत्येक शहरात/गावात मोफत घरपोच डिलिव्हरी (Cash on Delivery) देते. ऑर्डर केल्यानंतर २ ते ३ दिवसांत पार्सल तुमच्या घरी पोहोचते. ऑर्डर करण्यासाठी भेट द्या: https://www.sujatanutrilive.com किंवा थेट पत्ता पाठवून WhatsApp वर बुक करा: 9834783503!`,
        `नमस्कार! आमचे मुख्य युनिट नाशिक येथे आहे, पण आम्ही संपूर्ण भारतात थेट कुरिअर/पोस्टाद्वारे मोफत घरपोच डिलिव्हरी देतो. पार्सल मिळाल्यावर पैसे देण्याची सुविधा (COD) उपलब्ध आहे. ऑर्डरसाठी WhatsApp: 9834783503 🌿`
      ]);
    } else if (lang === 'hi') {
      return `नमस्ते! 🌿 हम आपके शहर सहित पूरे भारत में फ्री होम डिलीवरी और Cash on Delivery (COD) की सुविधा उपलब्ध कराते हैं। आर्डर करने के 2-3 दिनों में पार्सल आपके घर पहुँच जाता है। सीधे आर्डर करने के लिए विजिट करें: https://www.sujatanutrilive.com या WhatsApp करें: 9834783503!`;
    } else {
      return `Hello! 🌿 We deliver across your city and all over India with Free Home Delivery and Cash on Delivery (COD). Orders typically arrive within 2-3 business days. You can easily order at https://www.sujatanutrilive.com or WhatsApp us: +91 9834783503!`;
    }
  }

  // 10. Price / Cost / Buying
  if (lower === 'pp' || lower.includes('price') || lower.includes('cost') || lower.includes('किंमत') || lower.includes('kimat') || lower.includes('rate') || lower.includes('kit ki payment') || lower.includes('what is cost')) {
    if (lang === 'mr') {
      return pick([
        `नमस्कार! 🙏 सुजाता नॅचरल स्पिरुलिनाचा दररोजचा खर्च फक्त ₹१८ येतो! आमचा १ महिन्याचा स्पेशल हेल्थ कॉम्बो (स्पिरुलिना १२० टॅबलेट + सी-बकथॉर्न ६० कॅप्सूल) सध्या खास सवलतीत फक्त ₹९५० मध्ये उपलब्ध आहे. संपूर्ण भारतात Cash on Delivery (COD) आणि मोफत डिलिव्हरी आहे. ऑर्डर करण्यासाठी भेट द्या: https://www.sujatanutrilive.com किंवा थेट WhatsApp वर ऑर्डर बुक करा: 9834783503 🌿`,
        `नमस्कार! 🌿 सुजाता स्पिरुलिनाचा दैनंदिन खर्च फक्त ₹१८ आहे. सध्या आमचा २ महिन्यांचा सुपर हेल्थ कॉम्बो खास डिस्काउंट ऑफरमध्ये फक्त ₹९५० मध्ये घरपोच मिळत आहे (Cash on Delivery मोफत). ऑर्डरसाठी खालील लिंकवर क्लिक करा किंवा WhatsApp करा: 9834783503\n👉 https://www.sujatanutrilive.com`,
        `नमस्कार! 🙏 स्पिरुलिना १२० टॅब्लेट व सी-बकथॉर्न ६० कॅप्सूल्स कॉम्बो पॅकची ऑफर प्राईस फक्त ₹९५० आहे. घरपोच डिलिव्हरी व कॅश ऑन डिलिव्हरी मोफत उपलब्ध आहे. ऑर्डर बुक करण्यासाठी आपला पत्ता 9834783503 वर पाठवा किंवा वेबसाइटला भेट द्या: https://www.sujatanutrilive.com`
      ]);
    } else if (lang === 'hi') {
      return pick([
        `नमस्ते! 🙏 सुजाता नेचुरल स्पिरुलिना का दैनिक खर्च सिर्फ ₹18 आता है! हमारा स्पेशल हेल्थ कॉम्बो (स्पिरुलिना 120 टैबलेट + सी-बकथॉर्न 60 कैप्सूल) स्पेशल डिस्काउंट में मात्र ₹950 में उपलब्ध है। पूरे भारत में फ्री डिलीवरी और Cash on Delivery (घर पर भुगतान) की सुविधा है। आर्डर करने के लिए विजिट करें: https://www.sujatanutrilive.com या सीधे WhatsApp करें: 9834783503 🌿`,
        `नमस्ते जी! 🌿 सुजाता स्पिरुलिना का खर्च प्रतिदिन मात्र ₹18 है। 1 महीने का कम्पलीट हेल्थ कॉम्बो अभी स्पेशल ऑफर में ₹950 में उपलब्ध है (फ्री होम डिलीवरी + COD)। आर्डर बुक करने के लिए वेबसाइट देखें या WhatsApp करें: 9834783503\n👉 https://www.sujatanutrilive.com`
      ]);
    } else {
      return pick([
        `Hello! 🌿 Sujata Natural Spirulina costs just ₹18 per day! Our Daily Health Combo (Spirulina 120 Tablets + Sea Buckthorn 60 Capsules) is currently available at a special offer of only ₹950 with Free Shipping and Cash on Delivery (COD) across India. Place your order directly at https://www.sujatanutrilive.com or WhatsApp us: 9834783503.`,
        `Greetings! 🙏 Sujata Spirulina offers maximum nutrition at just ₹18/day. Our popular Health Combo Pack is available at an exclusive discounted price of ₹950 with Free COD shipping. Order online: https://www.sujatanutrilive.com or WhatsApp: +91 9834783503.`
      ]);
    }
  }

  // 11. Contact / Phone
  if (lower.includes('contect') || lower.includes('contact') || lower.includes('phone') || lower.includes('नंबर') || lower.includes('number')) {
    if (lang === 'mr') {
      return `नमस्कार! 🌿 सुजाता न्यूट्रीलाईव्हचा अधिकृत संपर्क व WhatsApp नंबर आहे: 📞 9834783503 / 9922534443. आपण थेट कॉल किंवा WhatsApp करून अधिक माहिती व ऑर्डर करू शकता!`;
    } else if (lang === 'hi') {
      return `नमस्ते! 🌿 सुजाता न्यूट्रीलाइव का आधिकारिक संपर्क व WhatsApp नंबर है: 📞 9834783503 / 9922534443. आप सीधे कॉल या WhatsApp करके जानकारी व आर्डर प्राप्त कर सकते हैं।`;
    } else {
      return `Hello! 🌿 You can reach Sujata Nutrilive official support directly on Phone & WhatsApp at 📞 +91 9834783503 or 9922534443. We are happy to assist you!`;
    }
  }

  // 12. Distributor / B2B / Franchise
  if (lower.includes('distributor') || lower.includes('monopoly') || lower.includes('franchise') || lower.includes('dealer') || lower.includes('bulk')) {
    if (lang === 'mr') {
      return `नमस्कार! 🌿 सुजाता न्यूट्रीलाईव्हच्या डिस्ट्रीब्यूटरशिप / डीलरशिपबाबत चौकशी केल्याबद्दल धन्यवाद. कृपया आपली माहिती (नाव, जिल्हा आणि संपर्क) थेट आमच्या मॅनेजमेंट टीमशी 9834783503 वर WhatsApp करा किंवा sujatanutrilive@gmail.com वर ईमेल करा. आमचे प्रतिनिधी आपल्याला सर्व नियम व अटींची माहिती देतील.`;
    } else if (lang === 'hi') {
      return `नमस्ते! 🌿 सुजाता न्यूट्रीलाइव डिस्ट्रीब्यूटरशिप / डीलरशिप में रुचि दिखाने के लिए धन्यवाद। कृपया अपना नाम, शहर और प्रोफाइल हमारे मैनेजमेंट नंबर 9834783503 पर WhatsApp करें या sujatanutrilive@gmail.com पर ईमेल भेजें। हमारी टीम आपसे तुरंत संपर्क करेगी।`;
    } else {
      return `Hello! 🌿 Thank you for your interest in Sujata Nutrilive Distributorship/Franchise. Please share your business profile, location, and contact details directly with our management via WhatsApp at +91 9834783503 or email us at sujatanutrilive@gmail.com. Our team will get back to you promptly.`;
    }
  }

  // 13. Suspicious / negative comment / spam filter objection
  if (lower.includes('लपवता') || lower.includes('कारण काय') || lower.includes('side effects') || lower.includes('fek') || lower.includes('fake')) {
    if (lang === 'mr') {
      return `नमस्कार सर! 🙏 आम्ही कोणाचीही खरी कमेंट कधीही लपवत नाही. फेसबुकच्या ऑटोमॅटिक स्पॅम फिल्टर अल्गोरिदममुळे काही प्रमोशनल लिंक्स किंवा अनोळखी शब्द आपोआप लपवले जातात. सुजाता स्पिरुलिना हे FSSAI लायसन्स प्राप्त आणि NABL मान्यताप्राप्त लॅबमधून १००% शुद्धतेसाठी प्रमाणित आहे. नाशिकमध्ये आमचे स्वतःचे मॅन्युफॅक्चरिंग युनिट आहे. आपण प्रत्यक्ष येऊन पाहू शकता किंवा लॅब टेस्ट रिपोर्ट्ससाठी थेट 9834783503 वर संपर्क करू शकता. धन्यवाद!`;
    } else {
      return `नमस्ते सर! 🙏 हम किसी भी ग्राहक की टिप्पणी कभी नहीं छिपाते। फेसबुक के ऑटोमैटिक स्पैम फिल्टर की वजह से कुछ लिंक्स खुद रिव्यू में चले जाते हैं। सुजाता स्पिरुलिना FSSAI लाइसेंस प्राप्त और NABL लैब से 100% शुद्धता के लिए प्रमाणित है। नासिक में हमारा स्वयं का प्लांट है। लैब रिपोर्ट्स या जानकारी के लिए 9834783503 पर संपर्क करें।`;
    }
  }

  // 14. Positive review / praise / धन्यवाद
  if (lower.includes('छान') || lower.includes('badhiya') || lower.includes('nashik') || lower.includes('khayi') || lower.includes('👍') || lower.includes('👌') || lower.includes('best') || lower.includes('nice') || lower.includes('good') || lower.includes('उपयोगी') || lower.includes('अप्रतिम') || lower.includes('love') || lower.includes('trustable') || lower.includes('धन्यवाद')) {
    if (lang === 'mr') {
      return pick([
        `खूप खूप धन्यवाद! 🌿 आपला विश्वास आणि अनुभव आमच्यासाठी मोलाचा आहे. सुजाता न्यूट्रीलाईव्ह सोबत असेच निरोगी राहा! पुढील ऑर्डर किंवा मोफत सल्ल्यासाठी थेट WhatsApp करा: 9834783503 ✨`,
        `मनःपूर्वक धन्यवाद! 🙏 आपला सकारात्मक अनुभव वाचून खूप आनंद झाला. १००% शुद्धतेचा हा वसा आम्ही असाच पुढे नेऊ. उत्तम आरोग्यासाठी सदैव सोबत: 9834783503 🌿`
      ]);
    } else if (lang === 'hi') {
      return pick([
        `बहुत-बहुत धन्यवाद! 🌿 आपका यह विश्वास और फीडबैक हमारे लिए अत्यंत महत्वपूर्ण है। सुजाता न्यूट्रीलाइव के साथ हमेशा स्वस्थ रहें! किसी भी सहायता या पुनः आर्डर के लिए WhatsApp: 9834783503 ✨`,
        `धन्यवाद जी! 🙏 आपका अनुभव जानकर बेहद खुशी हुई। शुद्ध और प्राकृतिक पोषण से हमेशा स्वस्थ रहें। WhatsApp: 9834783503 🌿`
      ]);
    } else {
      return `Thank you so much! 🌿 Your trust and wonderful feedback mean the world to us. Wishing you great health and energy with Sujata Nutrilive! For reorders or support: WhatsApp +91 9834783503 ✨`;
    }
  }

  // 15. General fallback
  if (lang === 'mr') {
    return `नमस्कार! 🙏 सुजाता न्यूट्रीलाईव्हशी संपर्क साधल्याबद्दल धन्यवाद. १००% शुद्ध स्पिरुलिना आणि नैसर्गिक सुपरफूड्सच्या माहितीसाठी, चालू सवलतींसाठी व मोफत घरपोच डिलिव्हरीसाठी भेट द्या: https://www.sujatanutrilive.com किंवा थेट 9834783503 वर WhatsApp करा! 🌿`;
  } else if (lang === 'hi') {
    return `नमस्ते! 🙏 सुजाता न्यूट्रीलाइव से जुड़ने के लिए धन्यवाद। 100% शुद्ध स्पिरुलिना व सुपरफूड्स की जानकारी, ऑफर्स और फ्री डिलीवरी के लिए वेबसाइट देखें: https://www.sujatanutrilive.com या सीधे 9834783503 पर WhatsApp करें! 🌿`;
  } else {
    return `Hello! 🌿 Thank you for reaching out to Sujata Nutrilive. For pure NABL certified Spirulina products, latest combo offers, and Free Home Delivery, visit https://www.sujatanutrilive.com or WhatsApp us at +91 9834783503!`;
  }
}

// API functions
async function replyCommentFacebook(commentId, message) {
  try {
    const url = `https://graph.facebook.com/v21.0/${commentId}/comments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: pageToken })
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

async function replyFacebookInboxThread(threadId, message, recipientId = null) {
  try {
    const url = `https://graph.facebook.com/v21.0/${threadId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: pageToken })
    });
    const data = await res.json();
    if (data.id || data.message_id) return data;

    // Fallback: try via /me/messages if recipientId is available
    if (recipientId) {
      const meUrl = `https://graph.facebook.com/v21.0/me/messages?access_token=${pageToken}`;
      const meRes = await fetch(meUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message }
        })
      });
      const meData = await meRes.json();
      if (meData.message_id) return meData;
    }
    return data;
  } catch (err) {
    return { error: err.message };
  }
}

async function replyInstagramComment(commentId, message) {
  try {
    const url = `https://graph.facebook.com/v21.0/${commentId}/replies`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: pageToken })
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export {
  detectLanguage,
  generateSmartReply,
  replyCommentFacebook,
  replyFacebookInboxThread,
  replyInstagramComment,
  sleep,
  randomBetween
};

# 🌿 Sujata Nutrilive — Shopify Admin & Headless Frontend Handover Manual 📘
> **दस्तावेज उद्देश:** या गाईडमध्ये आपण Headless Frontend वर काय काय इंटिग्रेट केले आहे आणि क्लायंटला भविष्यात **Shopify Admin** मधून वेबसाइट कशी नियंत्रित करता येईल, याचे संपूर्ण तपशीलवार मार्गदर्शन दिले आहे.

---

## 📑 अनुक्रमणिका (Table of Contents)
1. [भाग १: फ्रंटेंडवर काय काय बदल व इंटिग्रेशन केले? (What Was Implemented)](#भाग-१-फ्रंटेंडवर-काय-काय-बदल-व-इंटिग्रेशन-केले)
2. [भाग २: Shopify Admin मधून काय व कसे बदलायचे? (Step-by-Step Shopify Guide)](#भाग-२-shopify-admin-मधून-काय-व-कसे-बदलायचे)
   - [१. उत्पादनांच्या किंमती आणि डिस्काउंट्स (Price & Compare-At Price)](#१-उत्पादनांच्या-किंमती-आणि-डिस्काउंट्स-price--compare-at-price)
   - [२. होमपेजवरील उत्पादनांचा क्रम बदलणे (Homepage Product Sorting)](#२-होमपेजवरील-उत्पादनांचा-क्रम-बदलणे-homepage-product-sorting)
   - [३. उत्पादन बॅज आणि सबटायटल (Product Badges & Subtitles)](#३-उत्पादन-बॅज-आणि-सबटायटल-product-badges--subtitles)
   - [४. सायंटिफिक व क्लीनिकल मेटाफिल्ड्स (Active Compounds & Timeline)](#४-सायंटिफिक-व-क्लीनिकल-मेटाफिल्ड्स-active-compounds--timeline)
   - [५. लॅब टेस्ट रिपोर्ट पीडीएफ (NABL Certificate PDF Upload)](#५-लॅब-टेस्ट-रिपोर्ट-पीडीएफ-nabl-certificate-pdf-upload)
   - [६. स्टोअर पॉलिसीज अपडेट करणे (Store Legal Policies)](#६-स्टोअर-पॉलिसीज-अपडेट-करणे-store-legal-policies)
   - [७. न्यूझलेटर सबस्क्राईबर्स तपासणे (Newsletter Leads)](#७-न्यूझलेटर-सबस्क्राईबर्स-तपासणे-newsletter-leads)
   - [८. सपोर्ट व्हॉट्सॲप आणि फोन नंबर बदलणे (Brand Contact Config)](#८-सपोर्ट-व्हॉट्सॲप-आणि-फोन-नंबर-बदलणे-brand-contact-config)

---

# भाग १: फ्रंटेंडवर काय काय बदल व इंटिग्रेशन केले?

आता संपूर्ण वेबसाइट **"Shopify-First, Resilient Fallback Second"** या आंतरराष्ट्रीय दर्जाच्या आर्किटेक्चरवर काम करते:

1. **Dead Variant GIDs संपूर्णपणे नष्ट केले:**
   - आधीच्या कोडमध्ये एका जुन्या डेमो स्टोअरचे चुकीचे व्हेरिएंट आयडी (`59247880...`) होते, ज्यामुळे कार्ट आणि क्विझ चेकआउट तुटत होते.
   - आता सर्व १६ प्रॉडक्ट्सचे खरे, लाइव्ह Shopify Global Variant IDs जोडले गेले आहेत. त्यामुळे चेकआउट १००% यशस्वीपणे Shopify Web Checkout वर रिडायरेक्ट होतो.

2. **PDP वर थेट Shopify Metafields इंटिग्रेशन (`[handle].astro`):**
   - Active Compounds (घटक) आणि ३० दिवसांची टाईमलाईन आता थेट Shopify Metafields मधून JSON फॉरमॅटमध्ये वाचली जाते.
   - क्लायंटने Shopify मध्ये बदल केल्यास तो लगेच PDP वर दिसतो.

3. **Shopify Live CompareAtPrice डिस्काउंट्स (`StoreShopHub.astro`):**
   - कोडमध्ये मॅथेमॅटिकली डिस्काउंट काढणे बंद केले आहे. आता Shopify Admin मध्ये भरलेली 'Compare-at price' वाचून आपोआप `Save ₹XXX` किंवा `XX% OFF` चा हाय-कन्व्हर्जन बॅज तयार होतो.

4. **लाइव्ह स्टोअर पॉलिसीज (४ पेजेस):**
   - `privacy-policy`, `refund-policy`, `shipping-policy`, आणि `terms-of-service` हे ४ पेजेस थेट Shopify Storefront Policy API शी कनेक्ट केले आहेत.

5. **डायनॅमिक हिरो स्लायडर (`StoreHero.astro`):**
   - कॉम्बो, स्पिरुलिना आणि सी-बकथॉर्नच्या हिरो स्लाईड्स थेट लाईव्ह कॅटलॉगशी लिंक आहेत. किंमत बदलल्यास हिरो स्लाईड व टॅब बॅजेस आपोआप अपडेट होतात.

6. **न्यूझलेटर सबस्क्रिप्शन API (`/api/newsletter`):**
   - फुटरमधील ईमेल फॉर्म आता थेट Shopify Customer API शी जोडला असून सबस्क्राईब करणाऱ्या युझरला कूपन कोड (`SUJATA10`) आणि तात्काळ फीडबॅक मिळतो.

---

# भाग २: Shopify Admin मधून काय व कसे बदलायचे?

क्लायंटसाठी खालील स्टेप-बाय-स्टेप गाईड तयार करण्यात आली आहे:

---

### १. उत्पादनांच्या किंमती आणि डिस्काउंट्स (Price & Compare-At Price)
जर तुम्हाला एखाद्या उत्पादनाची किंमत बदलायची असेल किंवा त्यावर डिस्काउंट ऑफर चालवायची असेल:

1. तुमच्या **Shopify Admin** मध्ये लॉग इन करा (`https://admin.shopify.com/store/tvczdq-nu`).
2. डाव्या बाजूच्या मेनूमधून **Products** वर क्लिक करा.
3. ज्या उत्पादनाची किंमत बदलायची आहे त्यावर क्लिक करा (उदा. *Sujata Pure Organic Spirulina Powder*).
4. खाली स्क्रोल करून **Variants** सेक्शनमध्ये जा.
5. त्या व्हेरिएंटच्या समोरील **Price** आणि **Compare-at price** फील्ड एडिट करा:
   - **Price:** ग्राहकाला द्यायची अंतिम विक्री किंमत (उदा. `599`).
   - **Compare-at price:** मूळ छापील किंमत / MRP (उदा. `799`).
6. वर उजव्या कोपऱ्यातील **Save** बटणावर क्लिक करा.
👉 **वेबसाइटवर काय होईल:** वेबसाइटवर जुनी किंमत खोडून नवीन किंमत दिसेल आणि आपोआप **"SAVE 25%"** किंवा **"Save ₹200"** असा हाय-कन्व्हर्जन हिरवा बॅज तयार होईल!

---

### २. होमपेजवरील उत्पादनांचा क्रम बदलणे (Homepage Product Sorting)
जर तुम्हाला एखादे नवीन उत्पादन होमपेजवर सर्वात आधी दाखवायचे असेल किंवा उत्पादनांचा क्रम बदलायचा असेल:

1. **Shopify Admin -> Products -> Collections** वर क्लिक करा.
2. **Home page** (हँडल: `frontpage`) या कलेक्शनवर क्लिक करा.
3. **Products** सेक्शनमध्ये **Sort** पर्यायामध्ये **Manually** निवडा.
4. उत्पादनांच्या नावाच्या डाव्या बाजूला धरून त्यांना वर किंवा खाली **Drag & Drop** करा.
5. बदल सेव्ह करा.
👉 **वेबसाइटवर काय होईल:** होमपेजवरील कॅटलॉग ग्रिडमध्ये उत्पादने तुम्ही ठरवलेल्या त्याच अचूक क्रमाने दिसतील.

---

### ३. उत्पादन बॅज आणि सबटायटल (Product Badges & Subtitles)
उत्पादनाच्या कार्डवर वरच्या डाव्या कोपऱ्यात दिसणारा बॅज (उदा. *BESTSELLER*, *100% RAW PURE*) किंवा सबटायटल बदलण्यासाठी:

* **पर्याय A (Metafields द्वारे):**
  1. उत्पादन उघडा आणि सर्वात खाली स्क्रोल करून **Metafields** सेक्शनमध्ये जा.
  2. `badge` किंवा `badge_tag` मध्ये तुम्हाला हवा असलेला शब्द लिहा (उदा. `SPECIAL OFFER` किंवा `NEW LAUNCH`).
  3. `subtitle` मध्ये एक ओळीचे वैशिष्ट्य लिहा (उदा. `⚡ Pure Himalayan Harvest`).
* **पर्याय B (Tags द्वारे):**
  1. उत्पादनाच्या उजव्या बाजूला **Tags** सेक्शन असतो.
  2. तिथे नवीन टॅग टाका: `badge:BESTSELLER` किंवा `benefit:⚡ Instant Energy Boost`.
👉 **वेबसाइटवर काय होईल:** होमपेज आणि प्रॉडक्ट पेजवर हा नवीन बॅज व सबटायटल तात्काळ झळकेल.

---

### ४. सायंटिफिक व क्लीनिकल मेटाफिल्ड्स (Active Compounds & Timeline)
प्रॉडक्ट पेजवर (PDP) दिसणारे **Active Compounds** आणि **30-Day Protocol Timeline** बदलण्यासाठी:

1. उत्पादन उघडा आणि सर्वात खाली **Metafields** मध्ये जा.
2. **`custom.active_compounds`** मध्ये खालील फॉरमॅटमध्ये JSON डेटा पेस्ट किंवा एडिट करा:
```json
[
  {
    "name": "Phycocyanin",
    "potency": "18.5%",
    "role": "Master Cellular Antioxidant",
    "science": "Direct free-radical scavenger protecting cell mitochondria."
  },
  {
    "name": "Organic Iron",
    "potency": "4x Spinach",
    "role": "Bio-Available Blood Builder",
    "science": "Stimulates hemoglobin without digestive constipating side effects."
  }
]
```
3. **`custom.efficacy_timeline`** मध्ये खालील फॉरमॅटमध्ये ३ टप्प्यांची टाईमलाईन टाका:
```json
[
  {
    "phase": "Days 1 — 7",
    "title": "Cellular Awakening",
    "desc": "Active phycocyanin enters bloodstream, eliminating chronic 3 PM fatigue."
  },
  {
    "phase": "Days 8 — 21",
    "title": "Deep Gut Alkalization",
    "desc": "High alkaline chlorophyll balances gut microbiome and neutralizes acidity."
  },
  {
    "phase": "Days 22 — 30",
    "title": "Peak Biological Vitality",
    "desc": "Sustained cellular oxygenation, radiant skin, and unbreakable stamina."
  }
]
```
👉 *टीप: जर क्लायंटने नवीन उत्पादनासाठी हे मेटाफिल्ड रिकामे ठेवले, तरीही वेबसाइट क्रॅश होत नाही; ती ब्रँडचा सुरक्षित स्टँडर्ड डेटा आपोआप दाखवते.*

---

### ५. लॅब टेस्ट रिपोर्ट पीडीएफ (NABL Certificate PDF Upload)
ग्राहकांना अधिकृत सरकारी लॅब सर्टिफिकेट डाउनलोड करण्यासाठी द्यायचे असल्यास:

1. **Shopify Admin -> Content -> Files** मध्ये जाऊन तुमची NABL लॅब टेस्ट PDF फाईल अपलोड करा.
2. त्या फाईलची **Link (URL)** कॉपी करा (उदा. `https://cdn.shopify.com/.../Report.pdf`).
3. उत्पादन उघडा आणि खाली **Metafields -> `custom.lab_report_pdf`** मध्ये ती लिंक पेस्ट करा.
👉 **वेबसाइटवर काय होईल:** प्रॉडक्ट पेजवरील **"Download Certified NABL Lab Report (PDF)"** बटणावर क्लिक करताच ग्राहकाला ही खरी फाईल डाउनलोड होईल.

---

### ६. स्टोअर पॉलिसीज अपडेट करणे (Store Legal Policies)
रिटर्न कालावधी (उदा. ३० दिवसांवरून कमी/जास्त करणे), शिपिंग नियम किंवा प्रायव्हसी पॉलिसी बदलण्यासाठी:

1. **Shopify Admin -> खाली डाव्या कोपऱ्यातील Settings (गिअर आयकॉन) -> Policies** वर क्लिक करा.
2. येथे तुम्हाला खालील ४ पॉलिसीज दिसतील:
   - **Refund Policy** (परतावा नियम)
   - **Privacy Policy** (गोपनीयता नियम)
   - **Terms of Service** (सेवा अटी)
   - **Shipping Policy** (डिलिव्हरी व वाहतूक नियम)
3. यामध्ये तुमचा नवीन मजकूर टाईप करा आणि **Save** करा.
👉 **वेबसाइटवर काय होईल:** 
- `/privacy-policy`, `/refund-policy`, `/shipping-policy`, आणि `/terms-of-service` या पेजेसवर तुम्ही लिहिलेला मजकूर आपोआप सुंदर फॉरमॅटिंगसह दिसेल!

---

### ७. न्यूझलेटर सबस्क्राईबर्स तपासणे (Newsletter Leads)
वेबसाइटच्या फुटरमधून ज्या ग्राहकांनी ईमेल टाकून १०% डिस्काउंटसाठी सबस्क्राईब केले आहे, त्यांना पाहण्यासाठी:

1. **Shopify Admin -> Customers** वर जा.
2. **Email subscription status** फिल्टर निवडून **Subscribed** निवडा.
3. येथे तुम्हाला वेबसाइटवरून नोंदणी केलेल्या ग्राहकांची यादी दिसेल, ज्यांना तुम्ही Shopify Email किंवा Klaviyo द्वारे थेट ईमेल्स पाठवू शकता.

---

### ८. सपोर्ट व्हॉट्सॲप आणि फोन नंबर बदलणे (Brand Contact Config)
कस्टमर केअरचा फोन नंबर, व्हॉट्सॲप नंबर किंवा ईमेल बदलायचा असल्यास:
- हा डेटा एकाच ठिकाणी `src/config/brand.ts` मध्ये ठेवला आहे:
```typescript
export const BRAND_CONFIG = {
  supportPhone: "+91 98765 43210",
  supportWhatsAppNumber: "919876543210",
  supportEmail: "support@sujatanutrilive.com",
  ...
};
```
- किंवा Vercel Environment Variables मध्ये खालील व्हेरियबल्स सेट करूनही तो बदलता येतो:
  - `PUBLIC_SUPPORT_PHONE`
  - `PUBLIC_SUPPORT_WHATSAPP`
  - `PUBLIC_SUPPORT_EMAIL`
👉 **वेबसाइटवर काय होईल:** हे बदलताच संपूर्ण वेबसाइटवरील (हेडर, फुटर, कॉन्टॅक्ट पेज, ट्रॅक ऑर्डर, क्विझ) सर्व व्हॉट्सॲप व फोन लिंक्स एका सेकंदात बदलतील.

---

## 🏁 सारांश (Summary)
आता तुमची वेबसाइट पूर्णपणे **Zero-Code Maintenance** मोडमध्ये आहे. कोडिंगची कोणतीही माहिती नसलेली व्यक्तीदेखील **Shopify Admin** वापरून संपूर्ण स्टोअर सहज चालवू शकते!

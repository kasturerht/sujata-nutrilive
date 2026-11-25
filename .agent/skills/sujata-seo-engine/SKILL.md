---
name: sujata-seo-engine
description: Autonomous Pro-Level SEO & Programmatic Content Engine for Sujata Nutrilive. Generates rank #1 long-tail landing pages, Rich Schema (Article, FAQ, Product), Navboost retention content, and GEO/AEO optimization in Astro 6.
---

# 🚀 Sujata Nutrilive Pro-SEO & Programmatic Engine

This skill governs the autonomous creation, optimization, and auditing of search engine and AI-engine (GEO/AEO) ranking pages for **Sujata Nutrilive** (`sujatanutrilive.com`).

---

## 🎯 1. Target Goals (The 1,000 Daily Visitors Formula)
To achieve 1,000+ organic visitors daily without paying for ads or low-quality backlinks:
1. **Target Zero-Competition Long-Tail Queries**: Focus on high-intent informational queries in Marathi, Hindi, and English (e.g. *"spirulina benefits for weight loss in marathi"*, *"how to take spirulina tablets with warm water"*, *"pure himalayan shilajit vs fake test"*).
2. **Win Google Navboost (`goodClicks` & `lastLongestClicks`)**: Deliver the exact, unambiguous answer in the first 50 words so users never bounce back to Google.
3. **Capture High-Intent Buyers**: Seamlessly channel readers into purchasing Sujata Spirulina, Himalayan Shilajit, or Sea Buckthorn via direct cart actions and WhatsApp concierge.

---

## 📋 2. Strict Content & E-E-A-T Quality Standards
Google classifies health supplements under **YMYL (Your Money Your Life)**. Follow these non-negotiable rules:

* **Zero AI Fluff Ban**: NEVER use generic phrases:
  * ❌ *"In today's fast-paced world...", "In conclusion...", "It is important to remember...", "Delve into..."*
  * ✅ Provide direct data, NABL lab test numbers, dosages, and clinical facts immediately.
* **Authoritative Proof Badges**:
  * **FSSAI Central License**: `#11526999001381` (valid to 21-11-2027). Manufacturer FSSAI: `#10723998000433`
  * **Spirulina Protein Standard**: `62.39% plant protein` (IS 7219 Certified, NABL Lab Tested).
  * **Heavy Metals**: `0.00% Lead & Mercury` (Pure Hydro-dome cultivated).
  * **Manufacturing / Location**: Nashik, Maharashtra, India.
* **Structure Every Learn Page with**:
  1. **Immediate Answer (Featured Snippet Bait)**: Direct definition or solution in 2-3 crisp sentences.
  2. **Scientific/Nutritional Breakdown Table**: Compare dosages, nutrients, or forms (Tablets vs Powder vs Capsules).
  3. **Who Should Take & Who Should Avoid**: Specific medical contraindications (PKU, severe autoimmune disorders) to build high medical trust with Google.
  4. **Product Recommendation Card**: Sujata Nutrilive product card with ₹ pricing, discounts, and Add to Cart trigger.
  5. **Structured FAQ Section**: 5 to 7 detailed questions with expandable accordion and matching `FAQPage` Schema.

---

## 🛠️ 3. Technical Astro 6 Architecture & Template
All programmatic and educational landing pages must be placed under `src/pages/learn/[slug].astro`.

### Standard Boilerplate:
```astro
---
// src/pages/learn/[slug].astro
import StoreLayout from '../../layouts/StoreLayout.astro';
import StoreHeader from '../../components/StoreHeader.astro';
import StoreFooter from '../../components/StoreFooter.astro';
import { BRAND_CONFIG } from '../../config/brand';

const pageTitle = "Target Query Title (2026) | Sujata Nutrilive";
const pageDescription = "Crisp, benefit-driven meta description with exact keyword within first 60 characters.";
const pageUrl = "https://www.sujatanutrilive.com/learn/[slug]";

const faqs = [
  { question: "...", answer: "..." }
];

const articleAndFaqSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageUrl}/#article`,
    "headline": pageTitle,
    "description": pageDescription,
    "image": "https://www.sujatanutrilive.com/products/sujata-spirulina-transparent.png",
    "inLanguage": "mr-IN", // or "hi-IN" or "en-IN"
    "mainEntityOfPage": pageUrl,
    "datePublished": "2026-01-15T09:00:00+05:30",
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Sujata Nutrilive Clinical Research Team",
      "url": "https://www.sujatanutrilive.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sujata Nutrilive",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.sujatanutrilive.com/sujata-logo-transparent.png"
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}/#faq`,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
];
---

<StoreLayout title={pageTitle} description={pageDescription}>
  <script type="application/ld+json" set:html={JSON.stringify(articleAndFaqSchema)} />
  <StoreHeader />
  <!-- Page Content -->
  <StoreFooter />
</StoreLayout>
```

---

## ⚡ 4. 50 High-Converting Topic Clusters (Priority Roadmap)
When generating new ranking pages, pick from these high-volume clusters:

### Cluster A: Spirulina (Marathi & Regional Intent)
1. `spirulina-weight-loss-diet-plan` - स्पिरुलिना वजन कमी करण्यासाठी कसे घ्यावे?
2. `spirulina-tablets-vs-powder` - स्पिरुलिना टॅब्लेट की पावडर: काय चांगले आहे?
3. `spirulina-benefits-for-hair-growth` - केस गळतीवर स्पिरुलिनाचे फायदे व खाण्याची पद्धत
4. `spirulina-daily-dosage-for-women` - महिलांमधील अशक्तपणा व हिमोग्लोबिनसाठी स्पिरुलिना
5. `spirulina-side-effects-and-precautions` - स्पिरुलिना कोणी खाऊ नये? दुष्परिणाम आणि सावधगिरी

### Cluster B: Sea Buckthorn (Hindi & English Intent)
6. `sea-buckthorn-benefits-for-diabetic-patients` - क्या शुगर के मरीज सी बकथॉर्न ले सकते हैं?
7. `sea-buckthorn-oil-vs-capsules-for-skin` - Sea Buckthorn for glowing skin & anti-aging
8. `sea-buckthorn-benefits-for-heart-and-cholesterol` - कोलेस्ट्रॉल और हृदय स्वास्थ्य के लिए फायदे

### Cluster C: Himalayan Shilajit (Trust & Purity Intent)
9. `himalayan-shilajit-original-vs-fake` - असली शिलाजीत की पहचान कैसे करें (लैब टेस्ट रिपोर्ट)
10. `shilajit-benefits-for-stamina-and-vitality` - स्टॅमिना आणि ऊर्जा वाढवण्यासाठी शुद्ध शिलाजीत

---

## 🔄 5. Deployment & Sitemap Check
Whenever a new page is added:
1. Ensure the URL is added to `customPages` in `astro.config.mjs` (if SSR prerender requires it) or verified under `src/pages/learn/`.
2. Check `npm run build` quietly to ensure zero build breaks.
3. Ping search crawlers via `node scripts/instant-crawler-ping.mjs` or Google Indexing API.

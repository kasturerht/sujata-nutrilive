// src/lib/homeFaqs.ts
// Single source for the homepage FAQ. Rendered visibly in StoreAuthorityVault AND emitted as
// FAQPage schema in StoreLayout — Google requires both to match exactly, so edit only here.
// Compliance rules: no disease-cure claims, no unverified lab claims, no "organic".
import { BRAND_CONFIG } from '../config/brand';

const lab = BRAND_CONFIG.labReport;

export interface HomeFaq {
  question: string;
  answer: string;
  lang?: 'en' | 'hi' | 'mr';
}

export const homeFaqs: HomeFaq[] = [
  {
    question: "How do I know Sujata Spirulina is genuine and lab tested?",
    answer: `We publish our full lab report. ${lab.lab} report #${lab.number} (batch ${lab.batch}, issued ${lab.issueDate}) measured ${lab.proteinPct}% protein and ${lab.ironMgPerKg} mg/kg iron in our spirulina powder. Sujata Nutrilive Agrotech holds FSSAI Central License #${BRAND_CONFIG.fssaiNumber}. You can download the complete report from our homepage.`
  },
  {
    question: "Will it smell fishy or swampy like other spirulina?",
    answer: "No. Our spirulina is hydro-cultivated without chemicals and dried at low temperature (below 40°C), which keeps the smell mild. The vegetarian capsules have no noticeable odour; the powder has a light, fresh green taste."
  },
  {
    question: "Can I take spirulina if I have thyroid, diabetes or high BP?",
    answer: "Spirulina is a food supplement, not a medicine, and it should never replace your prescribed treatment. Please speak to your doctor before starting if you have an autoimmune condition (including Hashimoto's thyroiditis), take blood thinners, have phenylketonuria (PKU), or are pregnant or breastfeeding. If you take thyroid medicine, keep at least 4 hours between it and spirulina, as with any iron- or calcium-containing supplement."
  },
  {
    question: "Does spirulina cause gas, acidity or stomach upset?",
    answer: "Some people notice mild bloating or loose stools in the first few days as the body adjusts to the extra protein and fibre. Start with 1 capsule after breakfast for the first week, drink plenty of water, then move to the full 2 capsules a day. If discomfort continues, stop and consult your doctor."
  },
  {
    question: "Powder or capsules: which should I choose?",
    answer: "Both contain the same 100% pure spirulina with no binders or fillers. Choose capsules (2 a day, about 1 g) for a zero-taste, travel-friendly routine. Choose powder (1 scoop, about 3 g) if you like mixing it into lemon water, smoothies or coconut water and want a larger daily serving."
  },
  {
    question: "Why choose Sea Buckthorn capsules over bottled sea buckthorn juice?",
    answer: "Many bottled sea buckthorn juices are pasteurised and diluted, and often contain added sugar or preservatives to mask the berry's sour taste. Sujata Sea Buckthorn comes in vegetarian capsules with no added sugar and no preservatives, so a fixed daily serving is simple to take."
  },
  {
    question: "सी बकथॉर्न क्या है और इसे क्यों लिया जाता है?",
    answer: "सी बकथॉर्न (Sea Buckthorn) हिमालय के ऊंचे इलाकों में उगने वाली एक बेरी है। इसमें प्राकृतिक ओमेगा-7 (Palmitoleic Acid), ओमेगा 3, 6, 9 और विटामिन C पाए जाते हैं। लोग इसे मुख्य रूप से त्वचा की प्राकृतिक चमक और रोज़मर्रा के पोषण के लिए लेते हैं। सुजाता सी बकथॉर्न कैप्सूल में कोई अतिरिक्त चीनी या प्रिज़र्वेटिव नहीं है।",
    lang: 'hi'
  },
  {
    question: "स्पिरुलिना म्हणजे काय आणि ते का घेतात?",
    answer: `स्पिरुलिना (Spirulina) हे एक नैसर्गिक सुपरफूड आहे. सुजाता स्पिरुलिनाच्या लॅब रिपोर्टनुसार (${lab.number}) त्यात ${lab.proteinPct}% प्रथिने (Protein) आणि ${lab.ironMgPerKg} mg/kg नैसर्गिक लोह (Iron) आहे. रोजच्या आहारात वनस्पती प्रथिने वाढवण्यासाठी आणि दिवसभर नैसर्गिक ऊर्जा टिकवण्यासाठी अनेक जण ते घेतात.`,
    lang: 'mr'
  },
  {
    question: "How does your 90-Day Satisfaction Return Policy work?",
    answer: "Sujata products are dietary supplements, not medicines, and we make no guarantee of any specific health outcome. If, after using the product consistently for up to 90 days, you are not satisfied, contact our support team within 7 calendar days to process a return in line with our Refund Policy. Individual experience varies with diet, lifestyle and consistency."
  }
];

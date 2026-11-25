// src/config/learn-registry.mjs — every live /learn guide, for the hubs' link lists.
// Add a page here when it ships; remove it when it is retired (and add a 301).

export const INGREDIENT_HUBS = [
  { id: 'spirulina', path: '/learn/spirulina', name: 'Spirulina', hiName: 'स्पिरुलिना', mrName: 'स्पिरुलिना' },
  { id: 'sea-buckthorn', path: '/learn/sea-buckthorn', name: 'Sea buckthorn', hiName: 'सी बकथॉर्न', mrName: 'सी बकथॉर्न' },
];

export const LEARN_GUIDES = [
  { path: '/learn/how-to-take-spirulina', title: 'How to take spirulina: dosage and timing', ingredient: 'spirulina', lang: 'en' },
  { path: '/learn/spirulina-tablets-vs-capsules-vs-powder', title: 'Spirulina tablets vs capsules vs powder', ingredient: 'spirulina', lang: 'en' },
  { path: '/learn/spirulina-price-in-india-buyers-guide', title: 'Spirulina price in India: cost per day', ingredient: 'spirulina', lang: 'en' },
  { path: '/learn/best-spirulina-brand-in-india', title: 'Best spirulina brand in India: lab-test comparison', ingredient: 'spirulina', lang: 'en' },
  { path: '/learn/best-spirulina-brands-india-2026-comparison', title: 'Spirulina brands compared (2026)', ingredient: 'spirulina', lang: 'en' },
  { path: '/learn/spirulina-benefits-for-women', title: 'Spirulina for women: iron and protein', ingredient: 'spirulina', lang: 'en' },
  { path: '/learn/spirulina-in-hindi', title: 'स्पिरुलिना क्या है? (हिंदी)', ingredient: 'spirulina', lang: 'hi' },
  { path: '/learn/spirulina-in-marathi', title: 'स्पिरुलिना म्हणजे काय? (मराठी)', ingredient: 'spirulina', lang: 'mr' },
  { path: '/learn/spirulina-side-effects-in-marathi', title: 'स्पिरुलिनाचे दुष्परिणाम (मराठी)', ingredient: 'spirulina', lang: 'mr' },
  { path: '/learn/sea-buckthorn-capsules-buyers-guide', title: 'Sea buckthorn capsules: uses, dosage and price', ingredient: 'sea-buckthorn', lang: 'en' },
  { path: '/learn/pure-himalayan-sea-buckthorn-buying-guide', title: 'Himalayan sea buckthorn buying guide', ingredient: 'sea-buckthorn', lang: 'en' },
  { path: '/learn/which-company-sea-buckthorn-is-best', title: 'Which company sea buckthorn is best in India?', ingredient: 'sea-buckthorn', lang: 'en' },
  { path: '/learn/sea-buckthorn-in-hindi', title: 'सी बकथॉर्न क्या है? (हिंदी)', ingredient: 'sea-buckthorn', lang: 'hi' },
  { path: '/learn/sea-buckthorn-benefits-for-skin-in-hindi', title: 'सी बकथॉर्न और त्वचा (हिंदी)', ingredient: 'sea-buckthorn', lang: 'hi' },
  { path: '/learn/how-to-choose-supplement-brand-india-2026', title: 'How to choose a supplement brand in India', ingredient: 'general', lang: 'en' },
];

export const guidesFor = (ingredient) => LEARN_GUIDES.filter((g) => g.ingredient === ingredient);

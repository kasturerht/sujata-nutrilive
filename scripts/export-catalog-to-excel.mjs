import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const artifactDir = 'C:\\Users\\Prime\\.gemini\\antigravity\\brain\\5b259ba4-e5f7-4fae-9f9e-b9c23e1960df';

const masterCatalog = [
  // 1. FLAGSHIP SPIRULINA NUTRITION
  {
    sr: 1,
    category: 'Flagship Spirulina Superfoods',
    productName: 'Pure Organic Spirulina Powder',
    variantSize: '100g Resealable Pouch',
    amazonSku: 'L5-UK79-BHXE',
    amazonAsin: 'B0DP2FWN4J',
    shopifySku: 'SJT-SP-PWD-100G',
    mrp: 499,
    sellingPrice: 350,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-pure-organic-spirulina-powder-100g',
    amazonUrl: 'https://www.amazon.in/dp/B0DP2FWN4J',
    keyBenefits: '65% Bioavailable Plant Protein, Phycocyanin, Chlorophyll, Natural Iron, 100% Sun-Grown'
  },
  {
    sr: 2,
    category: 'Flagship Spirulina Superfoods',
    productName: '100% Vegan Spirulina Tablets (500mg)',
    variantSize: '60 Tablets (30 Days)',
    amazonSku: '8X-HQKV-14T7',
    amazonAsin: 'B0DNSXGGTN',
    shopifySku: 'SJT-SP-TAB-60',
    mrp: 400,
    sellingPrice: 350,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-100-vegan-spirulina-tablets-500mg-no-binders',
    amazonUrl: 'https://www.amazon.in/dp/B0DNSXGGTN',
    keyBenefits: 'Zero Binders, No Fillers, High Bioactive Iron for Daily Energy & Vitality'
  },
  {
    sr: 3,
    category: 'Flagship Spirulina Superfoods',
    productName: '100% Vegan Spirulina Tablets (500mg)',
    variantSize: '120 Tablets Value Pack (60 Days)',
    amazonSku: 'SJT-SP-TAB-120',
    amazonAsin: 'B0HMJD7SJ9',
    shopifySku: 'SJT-SP-TAB-120',
    mrp: 699,
    sellingPrice: 550,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-100-vegan-spirulina-tablets-500mg-no-binders',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJD7SJ9',
    keyBenefits: 'Extended 60-Day Economy Supply for Daily Cellular Energy & Muscle Recovery'
  },
  {
    sr: 4,
    category: 'Flagship Spirulina Superfoods',
    productName: 'Premium Spirulina Veg Capsules (500mg)',
    variantSize: '60 Veg Capsules (30 Days)',
    amazonSku: 'AB01',
    amazonAsin: 'B0GMQYS6M4',
    shopifySku: 'SJT-SP-CAP-60',
    mrp: 550,
    sellingPrice: 499,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-premium-spirulina-capsules-60-capsules-500mg',
    amazonUrl: 'https://www.amazon.in/dp/B0GMQYS6M4',
    keyBenefits: '100% Plant HPMC Shells, Ultra-Rapid Nutrient Absorption & Immune Defense'
  },
  {
    sr: 5,
    category: 'Flagship Spirulina Superfoods',
    productName: 'Premium Spirulina Veg Capsules (500mg)',
    variantSize: '120 Veg Capsules Value Pack (60 Days)',
    amazonSku: 'SJT-SP-CAP-120',
    amazonAsin: 'B0HMJFFVCW',
    shopifySku: 'SJT-SP-CAP-120',
    mrp: 1100,
    sellingPrice: 799,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-premium-spirulina-capsules-60-capsules-500mg',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJFFVCW',
    keyBenefits: '2-Month Stamina, Blood Purification & High Antioxidant Protection'
  },
  {
    sr: 6,
    category: 'Flagship Spirulina Superfoods',
    productName: 'Premium Spirulina Veg Capsules (500mg)',
    variantSize: '180 Veg Capsules Family Mega Pack (90 Days)',
    amazonSku: 'SJT-SP-CAP-180',
    amazonAsin: 'B0HMJRHQZL',
    shopifySku: 'SJT-SP-CAP-180',
    mrp: 1650,
    sellingPrice: 1099,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'Intake Review (24-48h)',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-premium-spirulina-capsules-60-capsules-500mg',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJRHQZL',
    keyBenefits: '90-Day Household Mega Bundle, Best Cost per Capsule'
  },

  // 2. HIMALAYAN SPECIALTY SUPPLEMENTS
  {
    sr: 7,
    category: 'Himalayan Specialty Supplements',
    productName: 'Himalayan Sea Buckthorn Capsules',
    variantSize: '60 Veg Capsules (Wild Berry)',
    amazonSku: 'SJT-SB-CAP-60',
    amazonAsin: 'B0HMJHWLV3',
    shopifySku: 'SJT-SB-CAP-60',
    mrp: 799,
    sellingPrice: 649,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-himalayan-sea-buckthorn-capsules-omega-3-6-7-9-60-capsules',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJHWLV3',
    keyBenefits: 'Pure Wild Sea Buckthorn, Richest Plant Source of Omega 3, 6, 7 & 9 for Skin & Heart'
  },
  {
    sr: 8,
    category: 'Himalayan Specialty Supplements',
    productName: 'Pure Himalayan Shilajit Capsules',
    variantSize: '60 Veg Capsules (500mg)',
    amazonSku: 'SJT-SHIL-CAP-60',
    amazonAsin: 'B0HMJHG237',
    shopifySku: 'SJT-SHIL-CAP-60',
    mrp: 699,
    sellingPrice: 649,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'Intake Review (24-48h)',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-pure-himalayan-shilajit-capsules-60-veg-capsules',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJHG237',
    keyBenefits: 'Purified Gold Grade Shilajit, >60% Fulvic Acid, 84+ Ionic Trace Minerals, Stamina'
  },
  {
    sr: 9,
    category: 'Himalayan Specialty Supplements',
    productName: 'Plant-Based Vitamin B12 Capsules',
    variantSize: '90 Veg Capsules (100% Vegan)',
    amazonSku: 'SJT-B12-CAP-90',
    amazonAsin: 'B0HMJDWMSB',
    shopifySku: 'SJT-B12-CAP-90',
    mrp: 699,
    sellingPrice: 649,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'Intake Review (24-48h)',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-plant-based-vitamin-b12-capsules-90-vegan-capsules',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJDWMSB',
    keyBenefits: '100% Natural Methylcobalamin, Supports Nerve Health, Brain Focus & Red Blood Cells'
  },
  {
    sr: 10,
    category: 'Himalayan Specialty Supplements',
    productName: 'Natural Moringa Leaf Powder',
    variantSize: '100g Resealable Pouch',
    amazonSku: 'SJT-MOR-PWD-100G',
    amazonAsin: 'B0HMJMYRS5',
    shopifySku: 'SJT-MOR-PWD-100G',
    mrp: 299,
    sellingPrice: 249,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-natural-moringa-leaf-powder-100g-pouch-detox-cleanse',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJMYRS5',
    keyBenefits: 'Drumstick Leaves, Rich in Polyphenols, Bioavailable Calcium & Gentle Colon Detox'
  },

  // 3. AYURVEDIC PERSONAL CARE & BEAUTY
  {
    sr: 11,
    category: 'Ayurvedic Beauty & Personal Care',
    productName: 'SpiruGlow Handmade Bath Soap',
    variantSize: '100g Single Bar',
    amazonSku: 'SJT-SP-SOAP-100G',
    amazonAsin: 'B0HMJF366D',
    shopifySku: 'SJT-SP-SOAP-100G',
    mrp: 60,
    sellingPrice: 60,
    hsnCode: '34011110',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spiruglow-handmade-organic-bath-soap-100g-bar',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJF366D',
    keyBenefits: 'Cold-Pressed Virgin Coconut Oil, Spirulina Chlorophyll, Pure Shea Butter, Zero SLS'
  },
  {
    sr: 12,
    category: 'Ayurvedic Beauty & Personal Care',
    productName: 'SpiruGlow Bath Soap (Value Pack of 5)',
    variantSize: '500g Total (5 Bars x 100g)',
    amazonSku: 'SJT-SP-SOAP-5PK',
    amazonAsin: 'B0HMKR4W22',
    shopifySku: 'SJT-SP-SOAP-5PK',
    mrp: 300,
    sellingPrice: 280,
    hsnCode: '34011110',
    websiteStatus: 'In Catalog Sync',
    amazonStatus: 'ASIN Assigned (Review)',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spiruglow-handmade-organic-bath-soap-100g-bar',
    amazonUrl: 'https://www.amazon.in/dp/B0HMKR4W22',
    keyBenefits: '₹56/bar Effective Rate, Family Value Pack, Deep Hydration & Antioxidant Skin Defense'
  },
  {
    sr: 13,
    category: 'Ayurvedic Beauty & Personal Care',
    productName: 'SpiruGlow Bath Soap (Family Pack of 10)',
    variantSize: '1000g / 1kg Total (10 Bars x 100g)',
    amazonSku: 'SJT-SP-SOAP-10PK',
    amazonAsin: 'B0HMKD5F7N',
    shopifySku: 'SJT-SP-SOAP-10PK',
    mrp: 600,
    sellingPrice: 550,
    hsnCode: '34011110',
    websiteStatus: 'In Catalog Sync',
    amazonStatus: 'ASIN Assigned (Review)',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spiruglow-handmade-organic-bath-soap-100g-bar',
    amazonUrl: 'https://www.amazon.in/dp/B0HMKD5F7N',
    keyBenefits: '₹55/bar Wholesale Economy Rate, Long-Lasting Natural Bathing Regimen'
  },
  {
    sr: 14,
    category: 'Ayurvedic Beauty & Personal Care',
    productName: 'Spirulina Korean Glass Skin Face Cream',
    variantSize: '25g Luxury Jar',
    amazonSku: 'SJT-SP-KC-50G',
    amazonAsin: 'B0HMJNTHKF',
    shopifySku: 'SJT-SP-KC-50G',
    mrp: 1200,
    sellingPrice: 999,
    hsnCode: '33049910',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'Intake Review (24-48h)',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spirulina-korean-cream-glass-skin-dark-spot-corrector-50g',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJNTHKF',
    keyBenefits: 'Concentrated 25g Niacinamide & Multi-Peptide Formula, Pore Tightening & Spot Correction'
  },
  {
    sr: 15,
    category: 'Ayurvedic Beauty & Personal Care',
    productName: 'Bridal Whitening & Radiance Luxury Cream',
    variantSize: '50g Luxury Jar',
    amazonSku: 'SJT-BR-CRM-50G',
    amazonAsin: 'B0HMJHFCL4',
    shopifySku: 'SJT-BR-CRM-50G',
    mrp: 1499,
    sellingPrice: 1199,
    hsnCode: '33049910',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-bridal-whitening-brightening-luxury-cream-50g',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJHFCL4',
    keyBenefits: 'Kashmiri Saffron, Kumkumadi Tailam, Spirulina Extract, Instant Glow & Dark Circle Removal'
  },
  {
    sr: 16,
    category: 'Ayurvedic Beauty & Personal Care',
    productName: 'Spirulina & Coconut Herbal Hair Oil',
    variantSize: '50ml Bottle (Single Pack)',
    amazonSku: 'SJT-SP-OIL-50ML',
    amazonAsin: 'B0HMJM64G3',
    shopifySku: 'SJT-SP-OIL-50ML',
    mrp: 350,
    sellingPrice: 249,
    hsnCode: '33059011',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spirulina-coconut-herbal-hair-oil-50ml-hair-fall-scalp-care',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJM64G3',
    keyBenefits: 'Virgin Coconut Oil Infused with Hibiscus, Bhringraj, Almond & Spirulina, Anti-Hairfall'
  },
  {
    sr: 17,
    category: 'Ayurvedic Beauty & Personal Care',
    productName: 'SpiruShine 2-in-1 Shampoo with Conditioner',
    variantSize: '100ml Bottle',
    amazonSku: 'SJT-SP-SHP-100ML',
    amazonAsin: 'B0HMJL173K',
    shopifySku: 'SJT-SP-SHP-100ML',
    mrp: 399,
    sellingPrice: 250,
    hsnCode: '33051090',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spirushine-spirulina-shampoo-with-conditioner-100ml-2-in-1',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJL173K',
    keyBenefits: 'Hydrolyzed Keratin Protein, Spirulina, Sulfate-Free Frizz Control & Natural Shine'
  },
  {
    sr: 18,
    category: 'Ayurvedic Beauty & Personal Care',
    productName: 'Spirulina Anti-Acne Face Wash',
    variantSize: '100ml Pump Bottle',
    amazonSku: 'SJT-SP-FW-100ML',
    amazonAsin: 'B0HMJNSZY2',
    shopifySku: 'SJT-SP-FW-100ML',
    mrp: 249,
    sellingPrice: 199,
    hsnCode: '33049990',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spirulina-anti-acne-face-wash-100ml-pump-bottle',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJNSZY2',
    keyBenefits: 'Active Tea Tree Oil, Neem Extract, Spirulina Chlorophyll, Deep Pore Oil Control'
  },
  {
    sr: 19,
    category: 'Ayurvedic Beauty & Personal Care',
    productName: 'Organic Spirulina Face Pack Powder',
    variantSize: '50g Resealable Pouch',
    amazonSku: 'AB29',
    amazonAsin: 'B0GNMB2P9X',
    shopifySku: 'SJT-SP-FP-50G',
    mrp: 249,
    sellingPrice: 199,
    hsnCode: '33049990',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-organic-spirulina-face-pack-powder-50g-pouch-detox-glow',
    amazonUrl: 'https://www.amazon.in/dp/B0GNMB2P9X',
    keyBenefits: 'Detoxifying Microalgae, Kaolin Clay, Instant Tan Removal & Natural Radiance'
  },

  // 4. SYNERGISTIC COMBOS & WELLNESS BUNDLES
  {
    sr: 20,
    category: 'Synergistic Combos & Bundles',
    productName: 'Daily Super Immunity Combo',
    variantSize: '90 Spirulina Tablets + 60 Sea Buckthorn Caps',
    amazonSku: 'SJT-COMBO-SP90-SB60',
    amazonAsin: 'B0HMJNJ2LP',
    shopifySku: 'SJT-COMBO-SP90-SB60',
    mrp: 1250,
    sellingPrice: 950,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-daily-super-immunity-combo-spirulina-tablets-sea-buckthorn-capsules',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJNJ2LP',
    keyBenefits: 'Dual Superfood Synergistic Immunity & Vitality Boost, Extended 45-Day Routine'
  },
  {
    sr: 21,
    category: 'Synergistic Combos & Bundles',
    productName: 'Immunity Power Combo (120T + 60C)',
    variantSize: '120 Spirulina Tablets + 60 Sea Buckthorn Caps',
    amazonSku: 'SJT-COMBO-SP120-SB60',
    amazonAsin: 'B0HMKBCF92',
    shopifySku: 'SJT-COMBO-SP120-SB60',
    mrp: 1498,
    sellingPrice: 1099,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'ASIN Assigned (Review)',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-daily-super-immunity-combo-spirulina-tablets-sea-buckthorn-capsules',
    amazonUrl: 'https://www.amazon.in/dp/B0HMKBCF92',
    keyBenefits: 'Legal Metrology Compliant (₹699+₹799=₹1,498), Full 60-Day Cellular Defense'
  },
  {
    sr: 22,
    category: 'Synergistic Combos & Bundles',
    productName: 'Healthy Life Combo Pack (1-Month Plan)',
    variantSize: '1 Bottle Spirulina + 1 Bottle Sea Buckthorn',
    amazonSku: 'SJT-CMBO-HL-1M',
    amazonAsin: 'B0HMJNHVNH',
    shopifySku: 'SJT-CMBO-HL-1M',
    mrp: 1485,
    sellingPrice: 1100,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spirulina-sea-buckthorn-healthy-life-combo-pack',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJNHVNH',
    keyBenefits: 'Entry Regimen for Daily Fatigue Reduction, Digestion & Cardiovascular Support'
  },
  {
    sr: 23,
    category: 'Synergistic Combos & Bundles',
    productName: 'Healthy Life Combo Pack (2-Month Plan)',
    variantSize: '2 Bottles Spirulina + 2 Bottles Sea Buckthorn',
    amazonSku: 'SJT-CMBO-HL-2M',
    amazonAsin: 'B0HMJRLX2C',
    shopifySku: 'SJT-CMBO-HL-2M',
    mrp: 2565,
    sellingPrice: 1900,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spirulina-sea-buckthorn-healthy-life-combo-pack',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJRLX2C',
    keyBenefits: 'Mid-Term Therapeutic Cellular Cleansing, Glowing Complexion & Stamina'
  },
  {
    sr: 24,
    category: 'Synergistic Combos & Bundles',
    productName: 'Healthy Life Combo Pack (3-Month Plan)',
    variantSize: '3 Bottles Spirulina + 3 Bottles Sea Buckthorn',
    amazonSku: 'SJT-CMBO-HL-3M',
    amazonAsin: 'B0HMJD6LYN',
    shopifySku: 'SJT-CMBO-HL-3M',
    mrp: 3645,
    sellingPrice: 2700,
    hsnCode: '21069099',
    websiteStatus: 'Active (In Stock)',
    amazonStatus: 'BUYABLE / Active',
    websiteUrl: 'https://www.sujatanutrilive.com/products/sujata-spirulina-sea-buckthorn-healthy-life-combo-pack',
    amazonUrl: 'https://www.amazon.in/dp/B0HMJD6LYN',
    keyBenefits: 'Complete 90-Day Seasonal Rejuvenation Regimen, Maximum Customer Value'
  }
];

// 1. Build Rows for Sheet 1: Master Catalog
const sheet1Rows = masterCatalog.map(item => {
  const discountAmount = item.mrp - item.sellingPrice;
  const discountPercent = Math.round((discountAmount / item.mrp) * 100);
  return {
    'Sr No': item.sr,
    'Product Category': item.category,
    'Product Title': item.productName,
    'Variant / Pack Size': item.variantSize,
    'Amazon SKU': item.amazonSku,
    'Amazon ASIN': item.amazonAsin,
    'Shopify SKU': item.shopifySku,
    'On-Bottle M.R.P. (INR)': item.mrp,
    'Official Selling Price (INR)': item.sellingPrice,
    'Customer Savings (INR)': discountAmount,
    'Discount %': `${discountPercent}%`,
    'Website (Shopify) Status': item.websiteStatus,
    'Amazon India Status': item.amazonStatus,
    'HSN Code': item.hsnCode,
    'Official Website URL': item.websiteUrl,
    'Amazon Product Link': item.amazonUrl,
    'Key Formulation & Benefits': item.keyBenefits
  };
});

// 2. Build Rows for Sheet 2: Category Summary
const categoryStats = {};
masterCatalog.forEach(item => {
  if (!categoryStats[item.category]) {
    categoryStats[item.category] = { count: 0, totalMrp: 0, totalPrice: 0 };
  }
  categoryStats[item.category].count++;
  categoryStats[item.category].totalMrp += item.mrp;
  categoryStats[item.category].totalPrice += item.sellingPrice;
});

const sheet2Rows = Object.keys(categoryStats).map((cat, idx) => {
  const s = categoryStats[cat];
  const avgDiscount = Math.round(((s.totalMrp - s.totalPrice) / s.totalMrp) * 100);
  return {
    'Sr No': idx + 1,
    'Category': cat,
    'Number of SKUs': s.count,
    'Combined Catalog MRP (INR)': s.totalMrp,
    'Combined Selling Price (INR)': s.totalPrice,
    'Average Customer Discount %': `${avgDiscount}%`
  };
});

// 3. Build Rows for Sheet 3: Channel Quick Lookup
const sheet3Rows = masterCatalog.map(item => ({
  'Shopify SKU': item.shopifySku,
  'Amazon SKU': item.amazonSku,
  'Amazon ASIN': item.amazonAsin,
  'Product Name': item.productName,
  'Pack / Weight': item.variantSize,
  'MRP (INR)': item.mrp,
  'Offer Price (INR)': item.sellingPrice
}));

// Create Workbook
const wb = XLSX.utils.book_new();

const ws1 = XLSX.utils.json_to_sheet(sheet1Rows);
const ws2 = XLSX.utils.json_to_sheet(sheet2Rows);
const ws3 = XLSX.utils.json_to_sheet(sheet3Rows);

// Set column widths for readability in Excel
ws1['!cols'] = [
  { wch: 6 },  // Sr
  { wch: 30 }, // Category
  { wch: 38 }, // Title
  { wch: 32 }, // Variant
  { wch: 22 }, // Amz SKU
  { wch: 14 }, // ASIN
  { wch: 22 }, // Shop SKU
  { wch: 18 }, // MRP
  { wch: 20 }, // Selling Price
  { wch: 18 }, // Savings
  { wch: 12 }, // Discount
  { wch: 20 }, // Web Status
  { wch: 22 }, // Amz Status
  { wch: 12 }, // HSN
  { wch: 45 }, // Web URL
  { wch: 35 }, // Amz URL
  { wch: 65 }  // Benefits
];

ws2['!cols'] = [
  { wch: 6 },
  { wch: 35 },
  { wch: 16 },
  { wch: 25 },
  { wch: 25 },
  { wch: 25 }
];

ws3['!cols'] = [
  { wch: 22 },
  { wch: 22 },
  { wch: 14 },
  { wch: 38 },
  { wch: 30 },
  { wch: 12 },
  { wch: 15 }
];

XLSX.utils.book_append_sheet(wb, ws1, 'Master Catalog');
XLSX.utils.book_append_sheet(wb, ws2, 'Category Summary');
XLSX.utils.book_append_sheet(wb, ws3, 'Channel Quick Lookup');

// Write .xlsx files
const localXlsxPath = path.join(rootDir, 'data', 'Sujata_Nutrilive_Master_Catalog_2026.xlsx');
const artifactXlsxPath = path.join(artifactDir, 'Sujata_Nutrilive_Master_Catalog_2026.xlsx');

XLSX.writeFile(wb, localXlsxPath);
XLSX.writeFile(wb, artifactXlsxPath);

// Write .csv files (from sheet 1)
const csvData = XLSX.utils.sheet_to_csv(ws1);
const localCsvPath = path.join(rootDir, 'data', 'Sujata_Nutrilive_Master_Catalog_2026.csv');
const artifactCsvPath = path.join(artifactDir, 'Sujata_Nutrilive_Master_Catalog_2026.csv');

fs.writeFileSync(localCsvPath, csvData);
fs.writeFileSync(artifactCsvPath, csvData);

console.log('✅ Generated Excel files:');
console.log('   - Local XLSX:', localXlsxPath);
console.log('   - Artifact XLSX:', artifactXlsxPath);
console.log('   - Local CSV:', localCsvPath);
console.log('   - Artifact CSV:', artifactCsvPath);

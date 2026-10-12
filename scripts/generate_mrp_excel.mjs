import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const raw = JSON.parse(fs.readFileSync('data/shopify-full-catalog.json', 'utf8'));

const rows = [
  // 1. Flagship Spirulina Superfoods
  {
    sr: 1,
    category: 'Spirulina Superfoods',
    productName: 'Sujata Pure Organic Spirulina Powder',
    packSize: '100g Resealable Pouch',
    sku: 'SJT-SP-PWD-100G',
    sellingPrice: 350,
    shopifyMrp: 799,
    realPrintedMrp: '', // To be filled by user/team
    packagingForm: 'Food-Grade Resealable Standup Pouch',
    notes: 'Single product',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-powder'
  },
  {
    sr: 2,
    category: 'Spirulina Superfoods',
    productName: 'Sujata 100% Vegan Spirulina Tablets (500mg)',
    packSize: '60 Tablets Bottle (30 Days)',
    sku: 'SJT-SP-TAB-60',
    sellingPrice: 350,
    shopifyMrp: 650,
    realPrintedMrp: '',
    packagingForm: 'HDPE Sealed Amber Bottle',
    notes: 'Single bottle (60 tabs)',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-tablets'
  },
  {
    sr: 3,
    category: 'Spirulina Superfoods',
    productName: 'Sujata 100% Vegan Spirulina Tablets (500mg)',
    packSize: '120 Tablets Bottle (60 Days)',
    sku: 'SJT-SP-TAB-120',
    sellingPrice: 550,
    shopifyMrp: 699,
    realPrintedMrp: '',
    packagingForm: 'HDPE Sealed Amber Bottle',
    notes: 'Single bottle (120 tabs)',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-tablets'
  },
  {
    sr: 4,
    category: 'Spirulina Superfoods',
    productName: 'Sujata Premium Spirulina Capsules (500mg)',
    packSize: '60 Vegan Capsules Bottle',
    sku: 'SJT-SP-CAP-60',
    sellingPrice: 499,
    shopifyMrp: 550,
    realPrintedMrp: '',
    packagingForm: 'HDPE Sealed Amber Bottle',
    notes: 'Single bottle (60 caps)',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-capsules'
  },
  {
    sr: 5,
    category: 'Spirulina Superfoods',
    productName: 'Sujata Premium Spirulina Capsules (500mg)',
    packSize: '120 Vegan Capsules (Value Pack - 2x60)',
    sku: 'SJT-SP-CAP-120',
    sellingPrice: 799,
    shopifyMrp: 1100,
    realPrintedMrp: '',
    packagingForm: '2 Bottles of 60 Capsules',
    notes: '2x 60 caps bottles',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-capsules'
  },
  {
    sr: 6,
    category: 'Spirulina Superfoods',
    productName: 'Sujata Premium Spirulina Capsules (500mg)',
    packSize: '180 Vegan Capsules (Mega Saver - 3x60)',
    sku: 'SJT-SP-CAP-180',
    sellingPrice: 1099,
    shopifyMrp: 1650,
    realPrintedMrp: '',
    packagingForm: '3 Bottles of 60 Capsules',
    notes: '3x 60 caps bottles',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-capsules'
  },

  // 2. Cellular & Herbal Nutrition
  {
    sr: 7,
    category: 'Cellular & Herbal Nutrition',
    productName: 'Sujata Himalayan Sea Buckthorn Capsules (Omega 3, 6, 7 & 9)',
    packSize: '60 Vegan Capsules Bottle',
    sku: 'SJT-SB-CAP-60',
    sellingPrice: 649,
    shopifyMrp: 999,
    realPrintedMrp: '',
    packagingForm: 'Transparent Safety Bottle',
    notes: 'Single bottle (60 caps)',
    url: 'https://www.sujatanutrilive.com/product/sujata-sea-buckthorn-capsules'
  },
  {
    sr: 8,
    category: 'Cellular & Herbal Nutrition',
    productName: 'Sujata Plant-Based Vitamin B12 Capsules',
    packSize: '90 Vegan Capsules Bottle',
    sku: 'SJT-B12-CAP-90',
    sellingPrice: 699,
    shopifyMrp: 1099,
    realPrintedMrp: '',
    packagingForm: 'HDPE Sealed Amber Bottle',
    notes: 'Single bottle (90 caps)',
    url: 'https://www.sujatanutrilive.com/product/sujata-plant-based-vitamin-b12'
  },
  {
    sr: 9,
    category: 'Cellular & Herbal Nutrition',
    productName: 'Sujata Pure Himalayan Shilajit Capsules (15,000mg)',
    packSize: '60 Veg Capsules Bottle',
    sku: 'SJT-SHIL-CAP-60',
    sellingPrice: 899,
    shopifyMrp: 1299,
    realPrintedMrp: '',
    packagingForm: 'HDPE Sealed Amber Bottle',
    notes: 'Single bottle (60 caps)',
    url: 'https://www.sujatanutrilive.com/product/sujata-pure-himalayan-shilajit'
  },
  {
    sr: 10,
    category: 'Cellular & Herbal Nutrition',
    productName: 'Sujata Natural Moringa Leaf Powder',
    packSize: '100g Resealable Pouch',
    sku: 'SJT-MOR-PWD-100G',
    sellingPrice: 249,
    shopifyMrp: 299,
    realPrintedMrp: '',
    packagingForm: 'Standup Resealable Pouch',
    notes: 'Single pouch (100g)',
    url: 'https://www.sujatanutrilive.com/product/sujata-moringa-powder'
  },

  // 3. Ayurvedic Skincare & Personal Care
  {
    sr: 11,
    category: 'Skincare & Personal Care',
    productName: 'Sujata Spirulina Anti-Acne Face Wash',
    packSize: '100ml Pump Bottle',
    sku: 'SJT-SP-FW-100ML',
    sellingPrice: 249,
    shopifyMrp: 499,
    realPrintedMrp: '',
    packagingForm: 'Dispenser Pump Bottle (100ml)',
    notes: 'Single bottle',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-facewash'
  },
  {
    sr: 12,
    category: 'Skincare & Personal Care',
    productName: 'Sujata Organic Spirulina Face Pack Powder',
    packSize: '50g Resealable Pouch',
    sku: 'SJT-SP-FP-50G',
    sellingPrice: 299,
    shopifyMrp: 399,
    realPrintedMrp: '',
    packagingForm: 'Standup Resealable Pouch (50g)',
    notes: 'Single pouch',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-facepack-powder'
  },
  {
    sr: 13,
    category: 'Skincare & Personal Care',
    productName: 'Sujata SpiruGlow Handmade Organic Bath Soap',
    packSize: '100g Soap Bar (Cold-Pressed)',
    sku: 'SJT-SP-SOAP-100G',
    sellingPrice: 60,
    shopifyMrp: 249,
    realPrintedMrp: '',
    packagingForm: 'Individually Boxed 100g Bar',
    notes: 'Single soap bar',
    url: 'https://www.sujatanutrilive.com/product/sujata-spiruglow-bath-soap'
  },
  {
    sr: 14,
    category: 'Skincare & Personal Care',
    productName: 'Sujata Spirulina Korean Cream (Glass Skin & Dark Spots)',
    packSize: '50g Luxury Jar',
    sku: 'SJT-SP-KC-50G',
    sellingPrice: 999,
    shopifyMrp: 799,
    realPrintedMrp: '',
    packagingForm: 'Luxury Cosmetic Jar (50g)',
    notes: 'Single jar',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-korean-cream'
  },
  {
    sr: 15,
    category: 'Skincare & Personal Care',
    productName: 'Sujata Bridal Whitening & Brightening Luxury Cream',
    packSize: '50g Luxury Jar',
    sku: 'SJT-BR-CRM-50G',
    sellingPrice: 699,
    shopifyMrp: 899,
    realPrintedMrp: '',
    packagingForm: 'Luxury Cosmetic Jar (50g)',
    notes: 'Single jar',
    url: 'https://www.sujatanutrilive.com/product/sujata-bridal-whitening-cream'
  },
  {
    sr: 16,
    category: 'Skincare & Personal Care',
    productName: 'Sujata Spirulina & Coconut Herbal Hair Oil',
    packSize: '50ml Applicator Bottle',
    sku: 'SJT-SP-OIL-50ML',
    sellingPrice: 299,
    shopifyMrp: 399,
    realPrintedMrp: '',
    packagingForm: 'Flip-top/Comb Applicator Bottle (50ml)',
    notes: 'Single bottle',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-coconut-hair-oil'
  },
  {
    sr: 17,
    category: 'Skincare & Personal Care',
    productName: 'Sujata SpiruShine Spirulina Shampoo with Conditioner (2-in-1)',
    packSize: '100ml Bottle',
    sku: 'SJT-SP-SHP-100ML',
    sellingPrice: 349,
    shopifyMrp: 499,
    realPrintedMrp: '',
    packagingForm: 'Shampoo Bottle (100ml)',
    notes: 'Single bottle',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirushine-shampoo-conditioner'
  },

  // 4. Value Immunity Combos
  {
    sr: 18,
    category: 'Immunity & Health Combos',
    productName: 'Sujata Daily Super Immunity Combo',
    packSize: '90 Spirulina Tablets + 60 Sea Buckthorn Capsules',
    sku: 'SJT-COMBO-SP90-SB60',
    sellingPrice: 950,
    shopifyMrp: 1250,
    realPrintedMrp: '',
    packagingForm: 'Combo Box (2 Bottles)',
    notes: 'Sum of both bottles printed MRP',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo'
  },
  {
    sr: 19,
    category: 'Immunity & Health Combos',
    productName: 'Sujata Daily Super Immunity Combo',
    packSize: '120 Spirulina Tablets + 60 Sea Buckthorn Capsules',
    sku: 'SJT-COMBO-SP120-SB60',
    sellingPrice: 1150,
    shopifyMrp: 1450,
    realPrintedMrp: '',
    packagingForm: 'Combo Box (2 Bottles)',
    notes: 'Sum of both bottles printed MRP',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo'
  },
  {
    sr: 20,
    category: 'Immunity & Health Combos',
    productName: 'Sujata Spirulina + Sea Buckthorn Healthy Life Combo Pack',
    packSize: '1-Month Plan (1x Spirulina Cap 60 + 1x Sea Buckthorn Cap 60)',
    sku: 'SJT-CMBO-HL-1M',
    sellingPrice: 1100,
    shopifyMrp: 1430,
    realPrintedMrp: '',
    packagingForm: 'Combo Box (2 Bottles of 60 Caps each)',
    notes: 'Sum of Spirulina Cap + Sea Buckthorn Cap printed MRP',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack'
  },
  {
    sr: 21,
    category: 'Immunity & Health Combos',
    productName: 'Sujata Spirulina + Sea Buckthorn Healthy Life Combo Pack',
    packSize: '2-Month Plan (2x Spirulina Cap 60 + 2x Sea Buckthorn Cap 60)',
    sku: 'SJT-CMBO-HL-2M',
    sellingPrice: 1900,
    shopifyMrp: 2860,
    realPrintedMrp: '',
    packagingForm: 'Combo Box (4 Bottles total)',
    notes: 'Sum of 4 bottles printed MRP',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack'
  },
  {
    sr: 22,
    category: 'Immunity & Health Combos',
    productName: 'Sujata Spirulina + Sea Buckthorn Healthy Life Combo Pack',
    packSize: '3-Month Plan (3x Spirulina Cap 60 + 3x Sea Buckthorn Cap 60)',
    sku: 'SJT-CMBO-HL-3M',
    sellingPrice: 2700,
    shopifyMrp: 4290,
    realPrintedMrp: '',
    packagingForm: 'Combo Box (6 Bottles total)',
    notes: 'Sum of 6 bottles printed MRP',
    url: 'https://www.sujatanutrilive.com/product/sujata-spirulina-sea-buckthorn-combo-pack'
  }
];

// Build Excel
const headers = [
  'Sr. No.',
  'Category',
  'Product Name',
  'Pack Size / Variant / Quantity',
  'SKU Code',
  'Current Selling Price (₹)',
  'Shopify System MRP (₹)',
  '👉 REAL PRINTED MRP (₹) [कृपया खरी छापील MRP येथे भरा]',
  'Packaging Type',
  'Combo Notes / Single Item',
  'Website Product URL'
];

const excelData = [
  headers,
  ...rows.map(r => [
    r.sr,
    r.category,
    r.productName,
    r.packSize,
    r.sku,
    r.sellingPrice,
    r.shopifyMrp,
    r.realPrintedMrp, // Blank for user input
    r.packagingForm,
    r.notes,
    r.url
  ])
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(excelData);

// Set column widths for great readability
ws['!cols'] = [
  { wch: 8 },  // Sr
  { wch: 25 }, // Category
  { wch: 42 }, // Product Name
  { wch: 38 }, // Pack Size
  { wch: 24 }, // SKU
  { wch: 22 }, // Selling Price
  { wch: 22 }, // Shopify MRP
  { wch: 35 }, // REAL PRINTED MRP
  { wch: 32 }, // Packaging
  { wch: 35 }, // Notes
  { wch: 60 }  // URL
];

XLSX.utils.book_append_sheet(wb, ws, 'Real Printed MRP Master');

// Ensure output dirs exist
const outDir1 = path.resolve('data');
if (!fs.existsSync(outDir1)) fs.mkdirSync(outDir1, { recursive: true });

const filePath1 = path.join(outDir1, 'Sujata_Nutrilive_Real_Printed_MRP_2026.xlsx');
XLSX.writeFile(wb, filePath1);
console.log('✅ Generated project Excel:', filePath1);

// Also copy to conversation artifact dir for easy access
const artifactDir = 'C:\\Users\\Prime\\.gemini\\antigravity\\brain\\76fba1b9-20c5-4353-919c-f10076a60a93';
if (fs.existsSync(artifactDir)) {
  const filePath2 = path.join(artifactDir, 'Sujata_Nutrilive_Real_Printed_MRP_2026.xlsx');
  XLSX.writeFile(wb, filePath2);
  console.log('✅ Generated artifact Excel:', filePath2);
}

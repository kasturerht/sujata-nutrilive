import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.substring(0, idx).trim()] = val;
      }
    }
  }
}
loadEnv();

async function getAccessToken() {
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.AMAZON_REFRESH_TOKEN,
      client_id: process.env.AMAZON_LWA_CLIENT_ID,
      client_secret: process.env.AMAZON_LWA_CLIENT_SECRET
    })
  });
  const data = await res.json();
  return data.access_token;
}

const sellerId = process.env.AMAZON_SELLER_ID || 'AD4L5XJBNYMFJ';
const marketId = process.env.AMAZON_MARKETPLACE_ID || 'A21TJRUUN4KGV';
const endpoint = process.env.AMAZON_SP_API_ENDPOINT || 'https://sellingpartnerapi-eu.amazon.com';

async function updateExistingPrices(token) {
  const updates = [
    {
      sku: 'SJT-BR-CRM-50G',
      productType: 'SKIN_MOISTURIZER',
      price: 1199,
      mrp: 1499,
      stock: 50
    },
    {
      sku: 'SJT-SP-OIL-50ML',
      productType: 'HAIR_STYLING_AGENT',
      price: 250,
      mrp: 349,
      stock: 50
    },
    {
      sku: 'SJT-SP-SHP-100ML',
      productType: 'SHAMPOO',
      price: 250,
      mrp: 399,
      stock: 50
    },
    {
      sku: 'SJT-SP-TAB-120',
      productType: 'HERBAL_SUPPLEMENT',
      price: 550,
      mrp: 699,
      stock: 50
    },
    {
      sku: 'SJT-SB-CAP-60',
      productType: 'HERBAL_SUPPLEMENT',
      price: 649,
      mrp: 799,
      stock: 50
    }
  ];

  console.log('\n--- 1. UPDATING EXISTING PRICES & MRPS ---');
  for (const item of updates) {
    console.log(`Updating SKU [${item.sku}]: Price: ₹${item.price} | MRP: ₹${item.mrp}...`);
    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.sku)}?marketplaceIds=${marketId}`;
    const payload = {
      productType: item.productType,
      patches: [
        {
          op: 'replace',
          path: '/attributes/fulfillment_availability',
          value: [{ fulfillment_channel_code: 'DEFAULT', quantity: item.stock }]
        },
        {
          op: 'replace',
          path: '/attributes/purchasable_offer',
          value: [{
            currency: 'INR',
            our_price: [{ schedule: [{ value_with_tax: item.price }] }],
            maximum_retail_price: [{ schedule: [{ value_with_tax: item.mrp }] }],
            marketplace_id: marketId
          }]
        }
      ]
    };

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`  Status: ${res.status} | Status: ${data.status} | Submission: ${data.submissionId}`);
    } catch (e) {
      console.error(`  Error on ${item.sku}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1200));
  }
}

async function createNewVariantsAndCombos(token) {
  console.log('\n--- 2. CREATING NEW MULTI-PACKS & COMBOS ---');

  const newItems = [
    {
      sku: 'SJT-SP-SOAP-5PK',
      productType: 'SKIN_CLEANING_AGENT',
      title: 'Sujata Nutrilive SpiruGlow Handmade Ayurvedic Bath Soap (Pack of 5 - 500g Total) | Pure Spirulina, Cold-Pressed Coconut Oil & Shea Butter | Daily Nourishing Bar',
      itemTypeName: 'Handmade Bath Soap',
      itemForm: 'Bar',
      hsnCode: '34011110',
      unitCountType: 'gram',
      unitCountValue: 500,
      numberOfItems: 5,
      itemPackageQuantity: 5,
      weightGrams: 500,
      dimensions: { height: 10, length: 15, width: 7 },
      price: 280,
      mrp: 300,
      description: 'Sujata Nutrilive SpiruGlow 5-Soap Value Pack provides a 500g multi-pack of cold-pressed, handcrafted Ayurvedic bath bars. Infused with sun-grown spirulina biomass, virgin cold-pressed coconut oil, and ultra-nourishing shea butter, each bar deeply moisturizes dry skin without sulfates or parabens.',
      bullets: [
        '5-BAR VALUE PACK (500g TOTAL): Complete family bathing bundle offering maximum savings compared to buying single bars.',
        'COLD-PROCESSED WITH ORGANIC SPIRULINA: Infuses epidermal cells with active chlorophyll, carotenoids, and protective antioxidants.',
        'VIRGIN COCONUT OIL & SHEA BUTTER: Delivers rich emollient hydration that keeps skin soft, supple, and moisturized all day.',
        '100% VEGAN & CHEMICAL FREE: Zero parabens, zero SLS/SLES, zero animal fats, and zero synthetic hardening chemicals.',
        'SUITABLE FOR ALL SKIN TYPES: PH-balanced formulation suitable for sensitive, dry, and combination skin types.'
      ],
      keywords: 'spirulina soap pack of 5 handmade organic bath bar natural cold pressed coconut oil shea butter moisturising herbal vegan 500g',
      images: [
        'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spiruglow-bath-soap-box.jpg',
        'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spiruglow-bath-soap-ingredients.jpg'
      ]
    },
    {
      sku: 'SJT-SP-SOAP-10PK',
      productType: 'SKIN_CLEANING_AGENT',
      title: 'Sujata Nutrilive SpiruGlow Handmade Ayurvedic Bath Soap (Family Pack of 10 - 1000g / 1kg Mega Pack) | Pure Spirulina, Virgin Coconut Oil & Shea Butter',
      itemTypeName: 'Handmade Bath Soap',
      itemForm: 'Bar',
      hsnCode: '34011110',
      unitCountType: 'gram',
      unitCountValue: 1000,
      numberOfItems: 10,
      itemPackageQuantity: 10,
      weightGrams: 1000,
      dimensions: { height: 12, length: 20, width: 10 },
      price: 550,
      mrp: 600,
      description: 'Sujata Nutrilive SpiruGlow 10-Soap Family Mega Pack delivers 1 kilogram of artisanal cold-processed bath bars. Slow-cured for peak glycerin retention and skin barrier therapy, this value bundle keeps the entire family supplied with pure Ayurvedic nourishment.',
      bullets: [
        '10-BAR FAMILY MEGA PACK (1 KG TOTAL): Ultimate bulk economy pack for households seeking premium organic bath care at lowest cost.',
        'NATURAL DEEP CELLULAR HYDRATION: Handcrafted with pure spirulina, cold-pressed coconut oil, and rich unrefined shea butter.',
        'NO HARSH CHEMICALS OR SULPHATES: Pure gentle saponification free from SLS, parabens, synthetic perfumes, and chemical fillers.',
        'ANTIOXIDANT SKIN DEFENSE: Enriches skin with bioavailable vitamins and microalgae minerals to combat environmental pollution.',
        'LONG-LASTING COLD PROCESS BAR: Dense, slow-melting formula that produces a creamy, non-drying lather.'
      ],
      keywords: 'spirulina soap pack of 10 family mega pack 1kg handmade organic bath bar natural cold pressed coconut oil shea butter vegan bulk',
      images: [
        'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spiruglow-bath-soap-box.jpg',
        'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spiruglow-bath-soap-ingredients.jpg'
      ]
    },
    {
      sku: 'SJT-COMBO-SP120-SB60',
      productType: 'HERBAL_SUPPLEMENT',
      title: 'Sujata Nutrilive Mega Synergy Wellness Combo | Spirulina Tablets (120 Tablets - 500mg) + Himalayan Sea Buckthorn Capsules (60 Veg Capsules) | Omegas 3, 6, 7, 9 & 65% Plant Protein',
      itemTypeName: 'Superfood Combo Kit',
      itemForm: 'Tablet',
      hsnCode: '21069099',
      unitCountType: 'count',
      unitCountValue: 180,
      numberOfItems: 2,
      itemPackageQuantity: 1,
      weightGrams: 240,
      dimensions: { height: 12, length: 12, width: 6 },
      price: 1099,
      mrp: 1498,
      description: 'Sujata Nutrilive Mega Synergy Wellness Combo combines an extended 60-day supply of pure cold-pressed Spirulina Tablets (120 Tablets, MRP ₹699) with wild Himalayan Sea Buckthorn Capsules (60 Veg Capsules, MRP ₹799). Total individual MRP value of ₹1,498 bundled at an exceptional promotional price of ₹1,099.',
      bullets: [
        '120 SPIRULINA TABLETS + 60 SEA BUCKTHORN CAPSULES: Extended dual-power superfood kit delivering 60-day cellular energy and skin nourishment.',
        'TOTAL COMBINED MRP ₹1,498: Maximum savings on our flagship Ayurvedic nutritional superfoods compared to buying individual bottles separately.',
        'COMPLETE PLANT PROTEIN & OMEGA 7: Delivers 65% bioavailable vegetable protein, active Phycocyanin, natural iron, and rare Omegas 3, 6, 7 & 9.',
        '100% VEGAN & ZERO FILLERS: No synthetic binders, no animal gelatins, no chemical glues, and strictly heavy-metal tested.',
        'DAILY USE PROTOCOL: Take 1-2 Spirulina tablets in the morning before meals, and 1 Sea Buckthorn capsule after dinner with water.'
      ],
      keywords: 'spirulina 120 sea buckthorn 60 combo pack superfood omega 7 multivitamin daily wellness vegan complete nutrition immunity bundle',
      images: [
        'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/Gemini_Generated_Image_yruxb3yruxb3yrux.png',
        'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-combo-product-showcase.png',
        'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-spirulina-tablets-bottle.jpg',
        'https://cdn.shopify.com/s/files/1/1025/6151/3604/files/sujata-sea-buckthorn-capsules-bottle.jpg'
      ]
    }
  ];

  for (const item of newItems) {
    console.log(`Creating SKU [${item.sku}]...`);
    console.log(`  Title: "${item.title.substring(0, 60)}..."`);
    console.log(`  Price: ₹${item.price} (MRP: ₹${item.mrp}) | Form: ${item.itemForm}`);

    const payload = {
      productType: item.productType,
      requirements: 'LISTING',
      attributes: {
        item_name: [{ language_tag: 'en_IN', value: item.title, marketplace_id: marketId }],
        brand: [{ language_tag: 'en_IN', value: 'Sujata nutrilive agrotech', marketplace_id: marketId }],
        manufacturer: [{ language_tag: 'en_IN', value: 'Sujata Nutrilive Agrotech', marketplace_id: marketId }],
        supplier_declared_has_product_identifier_exemption: [{ value: true, marketplace_id: marketId }],
        country_of_origin: [{ value: 'IN', marketplace_id: marketId }],
        supplier_declared_dg_hz_regulation: [{ value: 'storage', marketplace_id: marketId }],
        rtip_manufacturer_contact_information: [{ value: 'support@sujatanutrilive.com\n+919834783503', marketplace_id: marketId }],
        packer_contact_information: [{
          language_tag: 'en_IN',
          value: 'Plot No 125, Sai Niwas, ITI Ambad Link Road, Trimurti Chowk, Kamatwada, Nashik 422008, Maharashtra, India',
          marketplace_id: marketId
        }],
        importer_contact_information: [{
          language_tag: 'en_IN',
          value: 'Plot No 125, Sai Niwas, ITI Ambad Link Road, Trimurti Chowk, Kamatwada, Nashik 422008, Maharashtra, India',
          marketplace_id: marketId
        }],
        item_type_name: [{ language_tag: 'en_IN', value: item.itemTypeName, marketplace_id: marketId }],
        part_number: [{ value: item.sku, marketplace_id: marketId }],
        number_of_items: [{ value: item.numberOfItems, marketplace_id: marketId }],
        item_package_quantity: [{ value: item.itemPackageQuantity, marketplace_id: marketId }],
        item_form: [{ language_tag: 'en_IN', value: item.itemForm, marketplace_id: marketId }],
        is_expiration_dated_product: [{ value: true, marketplace_id: marketId }],
        product_expiration_type: [{ language_tag: 'en_IN', value: 'Expiration Date Required', marketplace_id: marketId }],
        fc_shelf_life: [{ unit: 'days', value: 730, marketplace_id: marketId }],
        condition_type: [{ value: 'new_new', marketplace_id: marketId }],
        product_description: [{ language_tag: 'en_IN', value: item.description, marketplace_id: marketId }],
        bullet_point: item.bullets.map(b => ({ language_tag: 'en_IN', value: b, marketplace_id: marketId })),
        generic_keyword: [{ language_tag: 'en_IN', value: item.keywords, marketplace_id: marketId }],
        unit_count: [{
          type: { language_tag: 'en_IN', value: item.unitCountType },
          value: item.unitCountValue,
          marketplace_id: marketId
        }],
        item_weight: [{ unit: 'grams', value: item.weightGrams, marketplace_id: marketId }],
        item_package_weight: [{ unit: 'grams', value: item.weightGrams + 50, marketplace_id: marketId }],
        item_dimensions: [{
          height: { unit: 'centimeters', value: item.dimensions.height },
          length: { unit: 'centimeters', value: item.dimensions.length },
          width: { unit: 'centimeters', value: item.dimensions.width },
          marketplace_id: marketId
        }],
        item_package_dimensions: [{
          height: { unit: 'centimeters', value: item.dimensions.height + 2 },
          length: { unit: 'centimeters', value: item.dimensions.length + 1 },
          width: { unit: 'centimeters', value: item.dimensions.width + 1 },
          marketplace_id: marketId
        }],
        external_product_information: [{ entity: 'HSN Code', value: item.hsnCode, marketplace_id: marketId }],
        purchasable_offer: [{
          currency: 'INR',
          our_price: [{ schedule: [{ value_with_tax: item.price }] }],
          maximum_retail_price: [{ schedule: [{ value_with_tax: item.mrp }] }],
          marketplace_id: marketId
        }]
      }
    };

    // Images
    if (item.images && item.images.length > 0) {
      payload.attributes.main_product_image_locator = [{ media_location: item.images[0], marketplace_id: marketId }];
      for (let i = 1; i < item.images.length; i++) {
        payload.attributes[`other_product_image_locator_${i}`] = [{ media_location: item.images[i], marketplace_id: marketId }];
      }
    }

    // Category specifics
    if (item.productType === 'HERBAL_SUPPLEMENT') {
      payload.attributes.fssai_veg_non_veg_status = [{ value: 'vegetarian', marketplace_id: marketId }];
      payload.attributes.flavor = [{ language_tag: 'en_IN', value: 'Unflavoured', marketplace_id: marketId }];
      payload.attributes.contains_liquid_contents = [{ value: false, marketplace_id: marketId }];
      payload.attributes.contains_food_or_beverage = [{ value: false, marketplace_id: marketId }];
    }

    if (item.productType === 'SKIN_CLEANING_AGENT') {
      payload.attributes.contains_liquid_contents = [{ value: false, marketplace_id: marketId }];
      payload.attributes.is_heat_sensitive = [{ value: false, marketplace_id: marketId }];
      payload.attributes.lifestyle = [{ value: 'Premium Beauty', marketplace_id: marketId }];
      payload.attributes.skin_type = [{ language_tag: 'en_IN', value: 'All', marketplace_id: marketId }];
      payload.attributes.batteries_required = [{ value: false, marketplace_id: marketId }];
      payload.attributes.target_audience_keyword = [{ language_tag: 'en_IN', value: 'Unisex Adult', marketplace_id: marketId }];
      payload.attributes.safety_warning = [{ language_tag: 'en_IN', value: 'For external use only. Avoid direct contact with eyes.', marketplace_id: marketId }];
      payload.attributes.scent = [{ language_tag: 'en_IN', value: 'Organic Coconut', marketplace_id: marketId }];
      payload.attributes.product_benefit = [{ language_tag: 'en_IN', value: 'Moisturizing', marketplace_id: marketId }];
      payload.attributes.specific_uses_for_product = [{ language_tag: 'en_IN', value: 'Daily Bathing, Deep Moisture, Skin Softening', marketplace_id: marketId }];
      payload.attributes.short_product_description = [{ language_tag: 'en_IN', value: item.description.substring(0, 200), marketplace_id: marketId }];
    }

    const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(item.sku)}?marketplaceIds=${marketId}`;
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`  Status: ${res.status} | Status: ${data.status} | Submission: ${data.submissionId}`);
    } catch (e) {
      console.error(`  Error creating ${item.sku}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1500));
  }
}

async function run() {
  const token = await getAccessToken();
  await updateExistingPrices(token);
  await createNewVariantsAndCombos(token);
  console.log('\n🎉 ALL REQUESTED PRICES, MULTI-PACKS & COMBOS SUCCESSFULLY APPLIED!');
}

run().catch(console.error);

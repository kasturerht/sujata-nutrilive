import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve('.env');
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      process.env[trimmed.substring(0, idx).trim()] = val;
    }
  }
}
loadEnv();

const domain = process.env.PUBLIC_SHOPIFY_STOREFRONT_DOMAIN || 'tvczdq-nu.myshopify.com';
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

async function getAdminToken() {
  const oRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })
  });
  const oData = await oRes.json();
  if (oData.access_token) {
    console.log("🔑 Generated fresh Admin OAuth token successfully!");
    return oData.access_token;
  }
  throw new Error("Failed to get OAuth token: " + JSON.stringify(oData));
}

async function setupMetafields() {
  const token = await getAdminToken();

  console.log("\n🚀 Step 1: Creating Metafield Definitions with PUBLIC_READ in Shopify Admin...\n");

  const definitionsToCreate = [
    {
      name: "Key Benefit",
      namespace: "custom",
      key: "key_benefit",
      type: "single_line_text_field",
      ownerType: "PRODUCT",
      access: { storefront: "PUBLIC_READ" }
    },
    {
      name: "Product Badge",
      namespace: "custom",
      key: "badge",
      type: "single_line_text_field",
      ownerType: "PRODUCT",
      access: { storefront: "PUBLIC_READ" }
    },
    {
      name: "How To Use Protocol",
      namespace: "custom",
      key: "how_to_use",
      type: "multi_line_text_field",
      ownerType: "PRODUCT",
      access: { storefront: "PUBLIC_READ" }
    },
    {
      name: "Clinical FAQs",
      namespace: "custom",
      key: "faqs",
      type: "json",
      ownerType: "PRODUCT",
      access: { storefront: "PUBLIC_READ" }
    },
    {
      name: "Comparison Table",
      namespace: "custom",
      key: "comparison_table",
      type: "json",
      ownerType: "PRODUCT",
      access: { storefront: "PUBLIC_READ" }
    }
  ];

  for (const def of definitionsToCreate) {
    const createDefQuery = `
      mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            name
            namespace
            key
            access {
              storefront
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    try {
      const res = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token
        },
        body: JSON.stringify({ query: createDefQuery, variables: { definition: def } })
      });
      const data = await res.json();
      if (data.data?.metafieldDefinitionCreate?.createdDefinition) {
        console.log(`✅ Definition Created: ${def.namespace}.${def.key} (Storefront: ${data.data.metafieldDefinitionCreate.createdDefinition.access?.storefront})`);
      } else {
        const errs = data.data?.metafieldDefinitionCreate?.userErrors || [];
        console.log(`ℹ️ Definition status for ${def.namespace}.${def.key}: ${errs.map(e => e.message).join(', ') || JSON.stringify(data.errors || {})}`);
      }
    } catch (e) {
      console.error(`❌ Error creating definition for ${def.key}:`, e.message);
    }
  }

  console.log("\n🚀 Step 2: Populating Spirulina Tablets Metafield Data into Shopify Admin...\n");

  const spirulinaFaqs = [
    {
      question: "सुजाता स्पिरुलिना गोळ्या बाजारातील इतर गोळ्यांपेक्षा कशा वेगळ्या आहेत? (Zero Chemical Binders)",
      answer: "बाजारातील बहुतेक गोळ्या बनवताना ३०% ते ४०% केमिकल बाईंडर्स (जसे की PVP, टाल्क, मॅग्नेशियम स्टिअर्रेट किंवा खडूची पावडर) वापरली जाते, ज्यामुळे पोट फुगणे किंवा अपचनाचा त्रास होतो. सुजाता स्पिरुलिना टॅब्लेट्स Sub-40°C कोल्ड कॉम्प्रेस मेकॅनिकल तंत्रज्ञानाने १००% शुद्ध मायक्रोअल्गी दाबून बनवल्या जातात. यात शून्य केमिकल बाईंडर्स आणि शून्य आर्टिफिशिअल कोटिंग असते. त्यामुळे ही कोमट पाण्यात सहज विरघळते आणि गॅस किंवा दुर्गंधीचा त्रास होत नाही.",
      tag: "Zero-Binder Technology"
    },
    {
      question: "सुजाता स्पिरुलिना गोळ्या पाण्यात विरघळतात का? (Zero-Binder Water Dissolution Test)",
      answer: "होय, अगदी सहज. एक सुजाता स्पिरुलिना गोळी एका काचेच्या पेल्यात कोमट पाण्यात टाकल्यास १२ ते १५ मिनिटांत ती नैसर्गिकरित्या विरघळते आणि पाणी गडद हिरवे होते. हीच १००% शुद्धतेची आणि शून्य केमिकल बाईंडर असण्याची खरी खूण आहे.",
      tag: "Water Dissolution Test"
    },
    {
      question: "स्पिरुलिना गोळ्या घेण्याची योग्य वेळ आणि पद्धत कोणती? (Dosage & Timing)",
      answer: "दररोज सकाळी नाश्त्यानंतर २० ते ३० मिनिटांनी २ गोळ्या एका ग्लास कोमट पाण्यासोबत किंवा लिंबू पाण्यासोबत घ्याव्यात. लिंबामधील नैसर्गिक व्हिटॅमिन सी मुळे स्पिरुलिनामधील नॉन-हीम प्लांट आयर्नचे शोषण ३००% वेगाने होते.",
      tag: "Dosage Protocol"
    },
    {
      question: "सुजाता स्पिरुलिना गोळ्यांची किंमत किती आहे? (Price & Value Packs)",
      answer: "सुजाता १००% व्हेगन स्पिरुलिना गोळ्या (५००mg) ६० गोळ्यांच्या पॅकसाठी ₹३५० (MRP ₹४००, ₹११.६६/दिवस) आणि १२० गोळ्यांच्या व्हॅल्यू पॅकसाठी ₹५५० (MRP ₹६९९, ₹९.१६/दिवस) उपलब्ध आहेत. १२० गोळ्यांच्या पॅकवर थेट ₹१५० रोख बचत होते. सर्व ऑर्डर्सवर फ्री डिलिव्हरी आणि कॅश ऑन डिलिव्हरी (COD) उपलब्ध आहे.",
      tag: "Transparent Pricing"
    },
    {
      question: "महिलांसाठी ॲनिमिया, केस गळणे आणि थकव्यासाठी हे फायदेशीर आहे का?",
      answer: "होय, अत्यंत गुणकारी आहे. सुजाता स्पिरुलिनामध्ये २९०.८९ mg/kg बायो-अवेलेबल नैसर्गिक प्लांट आयर्न आणि १८ आवश्यक अमिनो ॲसिड्स असतात. हे लाल रक्तपेशींमधील हिमोग्लोबिन वाढवून केस गळणे आणि दिवसभराचा थकवा मुळापासून दूर करते, आणि ॲलोपॅथिक आयर्नच्या गोळ्यांप्रमाणे बद्धकोष्ठता (Constipation) होत नाही.",
      tag: "Women's Health & Iron"
    },
    {
      question: "थायरॉईड, बीपी किंवा मधुमेहाचे रुग्ण स्पिरुलिना घेऊ शकतात का?",
      answer: "होय, नक्कीच. शुद्ध स्पिरुलिना हे नैसर्गिक संपूर्ण अन्न (Whole Food) असून त्यात कोणतीही साखर, स्टिम्युलंट्स किंवा हार्मोन्स नसतात. फक्त आपल्या सकाळच्या नेहमीच्या औषधांनंतर १ तासाचे अंतर ठेवून स्पिरुलिनाचे सेवन करावे.",
      tag: "Safety & Medication Gap"
    },
    {
      question: "सुजाता स्पिरुलिना गोळ्यांची लॅब चाचणी आणि शुद्धतेचे निकष काय आहेत?",
      answer: "सुजाताची प्रत्येक बॅच FSSAI परवानाधारक (#10723998000433) असून NABL मान्यताप्राप्त प्रयोगशाळेत (Lilaba Report #LAL-NN-131125023) IS 7219 मानकांनुसार तपासली जाते. यात ६२.३९% संपूर्ण प्रोटिन, २९०.८९ mg/kg नैसर्गिक लोह, सुरक्षित हेवी मेटल प्रमाण (Lead < 0.01 ppm, Arsenic < 0.05 ppm) आणि ०.००% केमिकल बाईंडर्स प्रमाणित आहेत.",
      tag: "NABL Lab Verification"
    }
  ];

  const spirulinaComparison = {
    title: "सुजाता १००% कोल्ड-कॉम्प्रेस्ड गोळ्या विरुद्ध इतर ब्रँड्स आणि केमिकल गोळ्या",
    subtitle: "वैज्ञानिक तुलना: शून्य केमिकल बाईंडर्स विरुद्ध ३०-४०% टाल्क आणि केमिकल गोळ्या",
    rows: [
      {
        feature: "केमिकल बाईंडर्स व टाल्क (Binders & Excipients)",
        sujata: "०% बाईंडर्स (१००% शुद्ध मायक्रोअल्गी)",
        generic: "३०% ते ४०% PVP, टाल्क, मॅग्नेशियम स्टिअर्रेट",
        competitors: "१००% सिंथेटिक केमिकल कोटिंग व फिलर्स"
      },
      {
        feature: "सुकवण्याचे तापमान (Dehydration Temperature)",
        sujata: "Sub-40°C क्रायो-ड्रायिंग (प्रोटिन व एन्झाइम्स जिवंत)",
        generic: "१६०°C–२००°C हाय-हीट (जळलेला वास येतो)",
        competitors: "केमिकल सॉल्व्हेंट प्रोसेस"
      },
      {
        feature: "पाण्यात विरघळणे (Dissolution & Digestion)",
        sujata: "कोमट पाण्यात १२-१५ मिनिटांत नैसर्गिक विरघळते",
        generic: "केमिकल कोटिंगमुळे विरघळायला २-३ तास लागतात",
        competitors: "बद्धकोष्ठता (Constipation) व काळी शौच होते"
      },
      {
        feature: "NABL लॅब हेवी मेटल चाचणी (Heavy Metals)",
        sujata: "NABL प्रमाणित (Lead < 0.01 ppm, Hg Undetected)",
        generic: "सहसा बॅच-वाइज चाचणी नसते",
        competitors: "केमिकल आयर्न टॉक्सिसिटीचा धोका"
      },
      {
        feature: "पाण्याचा स्रोत व शेती (Cultivation & Ecology)",
        sujata: "नाशिकच्या बंद बायो-डोम तळ्यांमधील शुद्ध भूजल",
        generic: "उघडी औद्योगिक तळी (कचऱ्याचा धोका)",
        competitors: "पेट्रोकेमिकल सिंथेसिस"
      },
      {
        feature: "दैनंदिन खर्च व गॅरंटी (Cost & Guarantee)",
        sujata: "फक्त ₹९.१६/दिवस + ४० दिवसांची परतावा गॅरंटी",
        generic: "₹१८–₹३०/दिवस (कोणतीही गॅरंटी नाही)",
        competitors: "₹१५–₹३५/दिवस (पचनाचा त्रास होतो)"
      }
    ]
  };

  const setMetafieldsMutation = `
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const metafieldsPayload = [
    {
      ownerId: 'gid://shopify/Product/10465847246980',
      namespace: 'custom',
      key: 'subtitle',
      type: 'single_line_text_field',
      value: '100% Pure Cold-Compressed Microalgae (Zero Chemical Binders or Talc)'
    },
    {
      ownerId: 'gid://shopify/Product/10465847246980',
      namespace: 'custom',
      key: 'key_benefit',
      type: 'single_line_text_field',
      value: 'Zero Chemical Binders • 62.3% Bio-Protein • Fast Lukewarm Water Dissolution'
    },
    {
      ownerId: 'gid://shopify/Product/10465847246980',
      namespace: 'custom',
      key: 'badge',
      type: 'single_line_text_field',
      value: '🌿 100% Pure Compressed Microalgae (Zero Chemical Binders)'
    },
    {
      ownerId: 'gid://shopify/Product/10465847246980',
      namespace: 'custom',
      key: 'how_to_use',
      type: 'multi_line_text_field',
      value: 'Take 2 tablets daily in the morning with lukewarm water or lemon water 20-30 minutes after breakfast. Vitamin C in lemon water boosts plant iron absorption by up to 300%.'
    },
    {
      ownerId: 'gid://shopify/Product/10465847246980',
      namespace: 'custom',
      key: 'faqs',
      type: 'json',
      value: JSON.stringify(spirulinaFaqs)
    },
    {
      ownerId: 'gid://shopify/Product/10465847246980',
      namespace: 'custom',
      key: 'comparison_table',
      type: 'json',
      value: JSON.stringify(spirulinaComparison)
    }
  ];

  try {
    const res = await fetch(`https://${domain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({ query: setMetafieldsMutation, variables: { metafields: metafieldsPayload } })
    });
    const data = await res.json();
    console.log("Response from Shopify MetafieldsSet:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("❌ Error setting metafields:", e.message);
  }
}

setupMetafields();

// scripts/generate-combo-pack-images.mjs
// Generates Amazon-compliant 2000x2000 pure white background multi-bottle images with soft contact shadows

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function createShadow(width, height) {
  // SVG ellipse shadow for realistic grounding
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="black" stop-opacity="0.28"/>
          <stop offset="60%" stop-color="black" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="black" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width * 0.45}" ry="${height * 0.35}" fill="url(#shadow)"/>
    </svg>
  `;
  return Buffer.from(svg);
}

async function generateImages() {
  const canvasSize = 2000;
  const spBottlePath = 'public/products/sujata-spirulina-capsules-bottle-transparent.png';
  const sbBottlePath = 'public/products/sujata-sea-buckthorn-capsules-bottle-transparent.png';

  // Target standard height for front bottles
  const targetBottleHeight = 1100;
  
  // Resize bottles with aspect ratio
  const spBuffer = await sharp(spBottlePath).resize({ height: targetBottleHeight }).toBuffer();
  const sbBuffer = await sharp(sbBottlePath).resize({ height: Math.round(targetBottleHeight * 0.95) }).toBuffer(); // Sea buckthorn is slightly more compact

  const spMeta = await sharp(spBuffer).metadata();
  const sbMeta = await sharp(sbBuffer).metadata();

  // Shadow buffers
  const spShadow = await sharp(await createShadow(spMeta.width + 100, 100)).toBuffer();
  const sbShadow = await sharp(await createShadow(sbMeta.width + 100, 100)).toBuffer();

  // -------------------------------------------------------------
  // 1. GENERATE 2-MONTH PACK (4 BOTTLES: 2 Spirulina + 2 Sea Buckthorn)
  // -------------------------------------------------------------
  console.log('🎨 Generating 2-Month (4-Bottle) Studio Image...');
  
  // Arrange in 2 rows or elegant staggered row:
  // Back row: 1 Spirulina (left-center), 1 Sea Buckthorn (right-center) slightly scaled down (0.9x)
  // Front row: 1 Spirulina (left), 1 Sea Buckthorn (right)
  const backScale = 0.88;
  const spBack = await sharp(spBottlePath).resize({ height: Math.round(targetBottleHeight * backScale) }).toBuffer();
  const sbBack = await sharp(sbBottlePath).resize({ height: Math.round(targetBottleHeight * 0.95 * backScale) }).toBuffer();
  const spBackMeta = await sharp(spBack).metadata();
  const sbBackMeta = await sharp(sbBack).metadata();

  const spBackShadow = await sharp(await createShadow(spBackMeta.width + 80, 80)).toBuffer();
  const sbBackShadow = await sharp(await createShadow(sbBackMeta.width + 80, 80)).toBuffer();

  const yBaseFront = 1450;
  const yBaseBack = 1280;

  const twoMonthComposite = [
    // Back row shadows
    { input: spBackShadow, top: yBaseBack + 10, left: 520 },
    { input: sbBackShadow, top: yBaseBack + 20, left: 1020 },
    // Back row bottles
    { input: spBack, top: yBaseBack - spBackMeta.height + 30, left: 520 + Math.round((spBackMeta.width + 80 - spBackMeta.width)/2) },
    { input: sbBack, top: yBaseBack - sbBackMeta.height + 40, left: 1020 + Math.round((sbBackMeta.width + 80 - sbBackMeta.width)/2) },

    // Front row shadows
    { input: spShadow, top: yBaseFront + 10, left: 320 },
    { input: sbShadow, top: yBaseFront + 20, left: 1180 },
    // Front row bottles
    { input: spBuffer, top: yBaseFront - spMeta.height + 30, left: 320 + Math.round((spMeta.width + 100 - spMeta.width)/2) },
    { input: sbBuffer, top: yBaseFront - sbMeta.height + 40, left: 1180 + Math.round((sbMeta.width + 100 - sbMeta.width)/2) },
  ];

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite(twoMonthComposite)
  .png({ quality: 95 })
  .toFile('public/products/sujata-combo-capsules-2month-4bottles.png');

  console.log('✅ Created: public/products/sujata-combo-capsules-2month-4bottles.png');

  // -------------------------------------------------------------
  // 2. GENERATE 3-MONTH PACK (6 BOTTLES: 3 Spirulina + 3 Sea Buckthorn)
  // Symmetrical Luxury Clustered Layout:
  // Left Cluster: 2 Spirulina in back, 1 Spirulina in front center
  // Right Cluster: 2 Sea Buckthorn in back, 1 Sea Buckthorn in front center
  // -------------------------------------------------------------
  console.log('🎨 Generating 3-Month (6-Bottle) Symmetrical Clustered Studio Image...');

  const bScale = 0.86;
  const spB = await sharp(spBottlePath).resize({ height: Math.round(targetBottleHeight * bScale) }).toBuffer();
  const sbB = await sharp(sbBottlePath).resize({ height: Math.round(targetBottleHeight * 0.95 * bScale) }).toBuffer();
  const spBMeta = await sharp(spB).metadata();
  const sbBMeta = await sharp(sbB).metadata();

  const spBShadow = await sharp(await createShadow(spBMeta.width + 70, 70)).toBuffer();
  const sbBShadow = await sharp(await createShadow(sbBMeta.width + 70, 70)).toBuffer();

  const yFront = 1450;
  const yBack = 1260;

  // Left Cluster (3 Spirulina Bottles)
  // Back row: left 240, left 620
  // Front row center: left 430
  // Right Cluster (3 Sea Buckthorn Bottles)
  // Back row: left 1060, left 1440
  // Front row center: left 1250

  const threeMonthComposite = [
    // Back row shadows
    { input: spBShadow, top: yBack + 10, left: 240 },
    { input: spBShadow, top: yBack + 10, left: 620 },
    { input: sbBShadow, top: yBack + 20, left: 1060 },
    { input: sbBShadow, top: yBack + 20, left: 1440 },

    // Back row bottles
    { input: spB, top: yBack - spBMeta.height + 25, left: 240 + Math.round((spBMeta.width + 70 - spBMeta.width)/2) },
    { input: spB, top: yBack - spBMeta.height + 25, left: 620 + Math.round((spBMeta.width + 70 - spBMeta.width)/2) },
    { input: sbB, top: yBack - sbBMeta.height + 35, left: 1060 + Math.round((sbBMeta.width + 70 - sbBMeta.width)/2) },
    { input: sbB, top: yBack - sbBMeta.height + 35, left: 1440 + Math.round((sbBMeta.width + 70 - sbBMeta.width)/2) },

    // Front row shadows
    { input: spShadow, top: yFront + 10, left: 430 },
    { input: sbShadow, top: yFront + 20, left: 1250 },

    // Front row bottles (Spirulina center-left, Sea Buckthorn center-right)
    { input: spBuffer, top: yFront - spMeta.height + 30, left: 430 + Math.round((spMeta.width + 100 - spMeta.width)/2) },
    { input: sbBuffer, top: yFront - sbMeta.height + 40, left: 1250 + Math.round((sbMeta.width + 100 - sbMeta.width)/2) },
  ];

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite(threeMonthComposite)
  .png({ quality: 95 })
  .toFile('public/products/sujata-combo-capsules-3month-6bottles.png');

  console.log('✅ Created: public/products/sujata-combo-capsules-3month-6bottles.png');
}

generateImages().catch(console.error);

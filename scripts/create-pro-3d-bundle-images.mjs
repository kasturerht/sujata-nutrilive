// scripts/create-pro-3d-bundle-images.mjs
// Symmetrical Amphitheater / Stadium Staging using 100% ORIGINAL authentic Sujata bottles
// Guarantees all logos, labels, caps, and bottle counts are proudly visible with true 3D perspective depth.

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SP_PATH = 'public/products/sujata-spirulina-capsules-bottle-transparent.png';
const SB_PATH = 'public/products/sujata-sea-buckthorn-capsules-bottle-transparent.png';
const CANVAS_SIZE = 2000;

// High-fidelity floor shadow with sharp contact line + soft diffuse ambient drop
function createStudioShadow(width, height, opacity = 0.40) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="contactCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000000" stop-opacity="${opacity * 1.5}"/>
          <stop offset="35%" stop-color="#000000" stop-opacity="${opacity * 0.8}"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="diffuseSpread" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#111111" stop-opacity="${opacity * 0.6}"/>
          <stop offset="55%" stop-color="#333333" stop-opacity="${opacity * 0.2}"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width * 0.48}" ry="${height * 0.45}" fill="url(#diffuseSpread)"/>
      <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width * 0.38}" ry="${height * 0.25}" fill="url(#contactCore)"/>
    </svg>
  `);
}

// Subtle luxury studio floor reflection
async function createFloorReflection(bottleBuffer, width, height, maxReflectionHeight = 110) {
  const cropHeight = Math.min(maxReflectionHeight, height);
  const bottomCrop = await sharp(bottleBuffer)
    .extract({
      left: 0,
      top: height - cropHeight,
      width: width,
      height: cropHeight
    })
    .flip()
    .toBuffer();

  const maskSvg = Buffer.from(`
    <svg width="${width}" height="${cropHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${cropHeight}" fill="url(#reflFade)"/>
    </svg>
  `);

  const fadeMask = await sharp(maskSvg).toColourspace('b-w').toBuffer();

  return await sharp(bottomCrop)
    .composite([{ input: fadeMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function run() {
  console.log('🚀 Loading original authentic bottle assets...');

  // Standard Hero front bottle height
  const HERO_HEIGHT = 1080;

  // Front bottles
  const spFront = await sharp(SP_PATH).resize({ height: HERO_HEIGHT }).toBuffer();
  const spFrontMeta = await sharp(spFront).metadata();

  const sbFrontHeight = Math.round(HERO_HEIGHT * 0.98);
  const sbFront = await sharp(SB_PATH).resize({ height: sbFrontHeight }).toBuffer();
  const sbFrontMeta = await sharp(sbFront).metadata();

  // Tier 2 (Mid-depth, scale 0.92, slight optical distance falloff)
  const TIER2_SCALE = 0.92;
  const spTier2 = await sharp(SP_PATH).resize({ height: Math.round(HERO_HEIGHT * TIER2_SCALE) }).modulate({ brightness: 0.98 }).toBuffer();
  const spTier2Meta = await sharp(spTier2).metadata();

  const sbTier2 = await sharp(SB_PATH).resize({ height: Math.round(sbFrontHeight * TIER2_SCALE) }).modulate({ brightness: 0.98 }).toBuffer();
  const sbTier2Meta = await sharp(sbTier2).metadata();

  // Tier 3 (Rear-depth, scale 0.85, slight optical distance falloff)
  const TIER3_SCALE = 0.85;
  const spTier3 = await sharp(SP_PATH).resize({ height: Math.round(HERO_HEIGHT * TIER3_SCALE) }).modulate({ brightness: 0.96 }).toBuffer();
  const spTier3Meta = await sharp(spTier3).metadata();

  const sbTier3 = await sharp(SB_PATH).resize({ height: Math.round(sbFrontHeight * TIER3_SCALE) }).modulate({ brightness: 0.96 }).toBuffer();
  const sbTier3Meta = await sharp(sbTier3).metadata();

  // Shadows
  const shadowH = 85;
  const spFrontShadow = await sharp(createStudioShadow(spFrontMeta.width + 110, shadowH, 0.42)).toBuffer();
  const sbFrontShadow = await sharp(createStudioShadow(sbFrontMeta.width + 110, shadowH, 0.40)).toBuffer();

  const spTier2Shadow = await sharp(createStudioShadow(spTier2Meta.width + 95, Math.round(shadowH * TIER2_SCALE), 0.36)).toBuffer();
  const sbTier2Shadow = await sharp(createStudioShadow(sbTier2Meta.width + 95, Math.round(shadowH * TIER2_SCALE), 0.36)).toBuffer();

  const spTier3Shadow = await sharp(createStudioShadow(spTier3Meta.width + 85, Math.round(shadowH * TIER3_SCALE), 0.32)).toBuffer();
  const sbTier3Shadow = await sharp(createStudioShadow(sbTier3Meta.width + 85, Math.round(shadowH * TIER3_SCALE), 0.32)).toBuffer();

  // Reflections
  const spFrontRefl = await createFloorReflection(spFront, spFrontMeta.width, spFrontMeta.height);
  const sbFrontRefl = await createFloorReflection(sbFront, sbFrontMeta.width, sbFrontMeta.height);

  const spTier2Refl = await createFloorReflection(spTier2, spTier2Meta.width, spTier2Meta.height, 90);
  const sbTier2Refl = await createFloorReflection(sbTier2, sbTier2Meta.width, sbTier2Meta.height, 90);

  // =========================================================================
  // 📸 2-MONTH PACK (4 BOTTLES): Symmetrical Modern V-Arc
  // Outer bottles stepped back and to the sides.
  // Center Hero pair in front.
  // Result: ALL 4 BOTTLES AND ALL 4 LOGOS ARE COMPLETELY UNOBSTRUCTED!
  // =========================================================================
  console.log('\n🎨 Composing 2-Month Multi-Pack (4 Original Bottles)...');

  const yFront = 1530;
  const yTier2 = 1420; // 110px elevated in Z-depth

  // Coordinates across 2000px:
  // Spirulina 1 (Back-outer-left): left 280
  // Spirulina 2 (Front-center-left): left 580
  // Sea Buckthorn 1 (Front-center-right): left 1020
  // Sea Buckthorn 2 (Back-outer-right): left 1320

  const twoMonthComposite = [
    // 1. Back row shadows
    { input: spTier2Shadow, top: yTier2 - 25, left: 280 - 50 },
    { input: sbTier2Shadow, top: yTier2 - 25, left: 1320 - 50 },

    // 2. Back row reflections
    { input: spTier2Refl, top: yTier2 - 2, left: 280 },
    { input: sbTier2Refl, top: yTier2 - 2, left: 1320 },

    // 3. Back row bottles (Spirulina 1 & Sea Buckthorn 2)
    { input: spTier2, top: yTier2 - spTier2Meta.height, left: 280 },
    { input: sbTier2, top: yTier2 - sbTier2Meta.height, left: 1320 },

    // 4. Front row shadows
    { input: spFrontShadow, top: yFront - 28, left: 580 - 55 },
    { input: sbFrontShadow, top: yFront - 28, left: 1020 - 55 },

    // 5. Front row reflections
    { input: spFrontRefl, top: yFront - 2, left: 580 },
    { input: sbFrontRefl, top: yFront - 2, left: 1020 },

    // 6. Front row Hero bottles (Spirulina 2 & Sea Buckthorn 1)
    { input: spFront, top: yFront - spFrontMeta.height, left: 580 },
    { input: sbFront, top: yFront - sbFrontMeta.height, left: 1020 },
  ];

  await sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite(twoMonthComposite)
  .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
  .toFile('public/products/sujata-combo-capsules-2month-4bottles-pro3d.jpg');

  console.log('✅ Generated 2-Month pro3d!');

  // =========================================================================
  // 📸 3-MONTH PACK (6 BOTTLES): Symmetrical 3-Step Amphitheater Arc
  // 3 Spirulina bottles descending on left: Tier 3 -> Tier 2 -> Front
  // 3 Sea Buckthorn bottles descending on right: Front <- Tier 2 <- Tier 3
  // Result: ALL 6 BOTTLES PROUDLY VISIBLE WITH ZERO LOGO OVERLAP!
  // =========================================================================
  console.log('\n🎨 Composing 3-Month Master Vault (6 Original Bottles)...');

  const yTier3 = 1330; // 200px elevated in Z-depth

  // Coordinates:
  // Spirulina 1 (Far-back-left): left 160, yTier3
  // Spirulina 2 (Mid-left): left 400, yTier2
  // Spirulina 3 (Front-center-left): left 640, yFront
  // Sea Buckthorn 1 (Front-center-right): left 1000, yFront
  // Sea Buckthorn 2 (Mid-right): left 1240, yTier2
  // Sea Buckthorn 3 (Far-back-right): left 1480, yTier3

  const threeMonthComposite = [
    // 1. Tier 3 Shadows & Reflections
    { input: spTier3Shadow, top: yTier3 - 22, left: 160 - 45 },
    { input: sbTier3Shadow, top: yTier3 - 22, left: 1480 - 45 },
    { input: spTier3, top: yTier3 - spTier3Meta.height, left: 160 },
    { input: sbTier3, top: yTier3 - sbTier3Meta.height, left: 1480 },

    // 2. Tier 2 Shadows, Reflections & Bottles
    { input: spTier2Shadow, top: yTier2 - 25, left: 400 - 50 },
    { input: sbTier2Shadow, top: yTier2 - 25, left: 1240 - 50 },
    { input: spTier2Refl, top: yTier2 - 2, left: 400 },
    { input: sbTier2Refl, top: yTier2 - 2, left: 1240 },
    { input: spTier2, top: yTier2 - spTier2Meta.height, left: 400 },
    { input: sbTier2, top: yTier2 - sbTier2Meta.height, left: 1240 },

    // 3. Front Hero Pair Shadows, Reflections & Bottles
    { input: spFrontShadow, top: yFront - 28, left: 640 - 55 },
    { input: sbFrontShadow, top: yFront - 28, left: 1000 - 55 },
    { input: spFrontRefl, top: yFront - 2, left: 640 },
    { input: sbFrontRefl, top: yFront - 2, left: 1000 },
    { input: spFront, top: yFront - spFrontMeta.height, left: 640 },
    { input: sbFront, top: yFront - sbFrontMeta.height, left: 1000 },
  ];

  await sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite(threeMonthComposite)
  .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
  .toFile('public/products/sujata-combo-capsules-3month-6bottles-pro3d.jpg');

  console.log('✅ Generated 3-Month pro3d!');
}

run().catch(console.error);

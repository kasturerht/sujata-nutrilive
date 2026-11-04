// scripts/generate-authentic-3d-bundles.mjs
import sharp from 'sharp';
import fs from 'fs';

async function generateAuthenticBundles() {
  const CANVAS = 2000;
  const HERO_HEIGHT = 1100;
  
  const spTrimmed = 'public/products/sujata-spirulina-trimmed.png';
  const sbTrimmed = 'public/products/sujata-sea-buckthorn-trimmed.png';
  
  // Front hero bottles
  const spFront = await sharp(spTrimmed).resize({ height: HERO_HEIGHT }).toBuffer();
  const spFrontMeta = await sharp(spFront).metadata();
  
  const sbHeight = Math.round(HERO_HEIGHT * 0.98);
  const sbFront = await sharp(sbTrimmed).resize({ height: sbHeight }).toBuffer();
  const sbFrontMeta = await sharp(sbFront).metadata();

  // Tier 2 (for 2-month back row and 3-month mid row)
  const TIER2_SCALE = 0.92;
  const spTier2H = Math.round(HERO_HEIGHT * TIER2_SCALE);
  const spTier2 = await sharp(spTrimmed).resize({ height: spTier2H }).modulate({ brightness: 0.98 }).toBuffer();
  const spTier2Meta = await sharp(spTier2).metadata();

  const sbTier2H = Math.round(sbHeight * TIER2_SCALE);
  const sbTier2 = await sharp(sbTrimmed).resize({ height: sbTier2H }).modulate({ brightness: 0.98 }).toBuffer();
  const sbTier2Meta = await sharp(sbTier2).metadata();

  // Tier 3 (for 3-month back row)
  const TIER3_SCALE = 0.85;
  const spTier3H = Math.round(HERO_HEIGHT * TIER3_SCALE);
  const spTier3 = await sharp(spTrimmed).resize({ height: spTier3H }).modulate({ brightness: 0.96 }).toBuffer();
  const spTier3Meta = await sharp(spTier3).metadata();

  const sbTier3H = Math.round(sbHeight * TIER3_SCALE);
  const sbTier3 = await sharp(sbTrimmed).resize({ height: sbTier3H }).modulate({ brightness: 0.96 }).toBuffer();
  const sbTier3Meta = await sharp(sbTier3).metadata();

  function makeShadow(bottleWidth, scale = 1.0, opacityMult = 1.0) {
    const w = Math.round(bottleWidth * 1.12);
    const h = Math.round(44 * scale);
    const aoOp = (0.50 * opacityMult).toFixed(2);
    const midOp = (0.24 * opacityMult).toFixed(2);
    const diffOp = (0.14 * opacityMult).toFixed(2);
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ao" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#050505" stop-opacity="${aoOp}"/>
            <stop offset="45%" stop-color="#151515" stop-opacity="${midOp}"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="diff" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#222222" stop-opacity="${diffOp}"/>
            <stop offset="65%" stop-color="#444444" stop-opacity="${(diffOp * 0.4).toFixed(2)}"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="${w / 2}" cy="${h / 2}" rx="${w * 0.48}" ry="${h * 0.44}" fill="url(#diff)"/>
        <ellipse cx="${w / 2}" cy="${h / 2}" rx="${w * 0.36}" ry="${h * 0.22}" fill="url(#ao)"/>
      </svg>
    `;
    return { buffer: Buffer.from(svg), width: w, height: h };
  }

  const spFrontSh = makeShadow(spFrontMeta.width, 1.0, 1.0);
  const sbFrontSh = makeShadow(sbFrontMeta.width, 1.0, 0.95);

  const spTier2Sh = makeShadow(spTier2Meta.width, TIER2_SCALE, 0.85);
  const sbTier2Sh = makeShadow(sbTier2Meta.width, TIER2_SCALE, 0.85);

  const spTier3Sh = makeShadow(spTier3Meta.width, TIER3_SCALE, 0.75);
  const sbTier3Sh = makeShadow(sbTier3Meta.width, TIER3_SCALE, 0.75);

  // -------------------------------------------------------------
  // 1. 2-MONTH PACK (4 BOTTLES)
  // Wide Symmetrical Amphitheater:
  // Rear bottles stepped out and elevated 150px.
  // -------------------------------------------------------------
  const yFront2M = 1600;
  const yTier2_2M = 1440; // 160px elevation
  
  const spBack2M_X = 220;
  const spFront2M_X = 550;
  const sbFront2M_X = 990;
  const sbBack2M_X = 1320;
  
  const comp2M = [
    // Rear shadows
    { input: spTier2Sh.buffer, top: Math.round(yTier2_2M - spTier2Sh.height / 2), left: Math.round(spBack2M_X + (spTier2Meta.width - spTier2Sh.width) / 2) },
    { input: sbTier2Sh.buffer, top: Math.round(yTier2_2M - sbTier2Sh.height / 2), left: Math.round(sbBack2M_X + (sbTier2Meta.width - sbTier2Sh.width) / 2) },
    // Rear bottles
    { input: spTier2, top: yTier2_2M - spTier2Meta.height, left: spBack2M_X },
    { input: sbTier2, top: yTier2_2M - sbTier2Meta.height, left: sbBack2M_X },
    // Front shadows
    { input: spFrontSh.buffer, top: Math.round(yFront2M - spFrontSh.height / 2), left: Math.round(spFront2M_X + (spFrontMeta.width - spFrontSh.width) / 2) },
    { input: sbFrontSh.buffer, top: Math.round(yFront2M - sbFrontSh.height / 2), left: Math.round(sbFront2M_X + (sbFrontMeta.width - sbFrontSh.width) / 2) },
    // Front bottles
    { input: spFront, top: yFront2M - spFrontMeta.height, left: spFront2M_X },
    { input: sbFront, top: yFront2M - sbFrontMeta.height, left: sbFront2M_X },
  ];

  await sharp({
    create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite(comp2M)
  .jpeg({ quality: 97, chromaSubsampling: '4:4:4' })
  .toFile('public/products/sujata-combo-capsules-2month-4bottles-pro3d.jpg');

  fs.copyFileSync(
    'public/products/sujata-combo-capsules-2month-4bottles-pro3d.jpg',
    'C:/Users/Admin/.gemini/antigravity/brain/aff0f6db-617f-4f89-832a-fb17a77cad3f/sujata-combo-capsules-2month-4bottles-pro3d.jpg'
  );
  console.log('✅ Generated refined 2-Month pro3d');

  // -------------------------------------------------------------
  // 2. 3-MONTH PACK (6 BOTTLES)
  // Symmetrical 3-Tier Amphitheater:
  // Rear tier: elevated 250px
  // Mid tier: elevated 130px
  // Front tier: ground level
  // -------------------------------------------------------------
  const yFront3M = 1620;
  const yMid3M = 1470;
  const yRear3M = 1330;

  const spRear_X = 110;
  const spMid_X = 350;
  const spFront_X = 590;

  const sbFront_X = 970;
  const sbMid_X = 1210;
  const sbRear_X = 1450;

  const comp3M = [
    // Tier 3 shadows & bottles
    { input: spTier3Sh.buffer, top: Math.round(yRear3M - spTier3Sh.height / 2), left: Math.round(spRear_X + (spTier3Meta.width - spTier3Sh.width) / 2) },
    { input: sbTier3Sh.buffer, top: Math.round(yRear3M - sbTier3Sh.height / 2), left: Math.round(sbRear_X + (sbTier3Meta.width - sbTier3Sh.width) / 2) },
    { input: spTier3, top: yRear3M - spTier3Meta.height, left: spRear_X },
    { input: sbTier3, top: yRear3M - sbTier3Meta.height, left: sbRear_X },

    // Tier 2 shadows & bottles
    { input: spTier2Sh.buffer, top: Math.round(yMid3M - spTier2Sh.height / 2), left: Math.round(spMid_X + (spTier2Meta.width - spTier2Sh.width) / 2) },
    { input: sbTier2Sh.buffer, top: Math.round(yMid3M - sbTier2Sh.height / 2), left: Math.round(sbMid_X + (sbTier2Meta.width - sbTier2Sh.width) / 2) },
    { input: spTier2, top: yMid3M - spTier2Meta.height, left: spMid_X },
    { input: sbTier2, top: yMid3M - sbTier2Meta.height, left: sbMid_X },

    // Front Hero shadows & bottles
    { input: spFrontSh.buffer, top: Math.round(yFront3M - spFrontSh.height / 2), left: Math.round(spFront_X + (spFrontMeta.width - spFrontSh.width) / 2) },
    { input: sbFrontSh.buffer, top: Math.round(yFront3M - sbFrontSh.height / 2), left: Math.round(sbFront_X + (sbFrontMeta.width - sbFrontSh.width) / 2) },
    { input: spFront, top: yFront3M - spFrontMeta.height, left: spFront_X },
    { input: sbFront, top: yFront3M - sbFrontMeta.height, left: sbFront_X },
  ];

  await sharp({
    create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite(comp3M)
  .jpeg({ quality: 97, chromaSubsampling: '4:4:4' })
  .toFile('public/products/sujata-combo-capsules-3month-6bottles-pro3d.jpg');

  fs.copyFileSync(
    'public/products/sujata-combo-capsules-3month-6bottles-pro3d.jpg',
    'C:/Users/Admin/.gemini/antigravity/brain/aff0f6db-617f-4f89-832a-fb17a77cad3f/sujata-combo-capsules-3month-6bottles-pro3d.jpg'
  );
  console.log('✅ Generated refined 3-Month pro3d');
}

generateAuthenticBundles().catch(console.error);

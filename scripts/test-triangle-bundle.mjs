// scripts/test-triangle-bundle.mjs
import sharp from 'sharp';
import fs from 'fs';

async function testTriangle() {
  const CANVAS = 2000;
  const HERO_HEIGHT = 1040;
  
  const spTrimmed = 'public/products/sujata-spirulina-trimmed.png';
  const sbTrimmed = 'public/products/sujata-sea-buckthorn-trimmed.png';
  
  // Front hero bottles
  const spFront = await sharp(spTrimmed).resize({ height: HERO_HEIGHT }).toBuffer();
  const spFrontMeta = await sharp(spFront).metadata();
  
  const sbHeight = Math.round(HERO_HEIGHT * 0.98);
  const sbFront = await sharp(sbTrimmed).resize({ height: sbHeight }).toBuffer();
  const sbFrontMeta = await sharp(sbFront).metadata();

  // Rear bottles (scale 0.90, elevated)
  const REAR_SCALE = 0.90;
  const spRearH = Math.round(HERO_HEIGHT * REAR_SCALE);
  const spRear = await sharp(spTrimmed).resize({ height: spRearH }).modulate({ brightness: 0.98 }).toBuffer();
  const spRearMeta = await sharp(spRear).metadata();

  const sbRearH = Math.round(sbHeight * REAR_SCALE);
  const sbRear = await sharp(sbTrimmed).resize({ height: sbRearH }).modulate({ brightness: 0.98 }).toBuffer();
  const sbRearMeta = await sharp(sbRear).metadata();

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
  const spRearSh = makeShadow(spRearMeta.width, REAR_SCALE, 0.85);
  const sbRearSh = makeShadow(sbRearMeta.width, REAR_SCALE, 0.85);

  const yFront = 1620;
  const yRear = 1450; // 170px elevation in rear

  // -------------------------------------------------------------
  // DUAL TRIANGLE FORMATION (6 BOTTLES):
  // Left: 3 Spirulina bottles (1 rear-left, 1 rear-right, 1 front-center)
  // Right: 3 Sea Buckthorn bottles (1 rear-left, 1 rear-right, 1 front-center)
  // -------------------------------------------------------------
  // Left Cluster Center ~ 570
  // Right Cluster Center ~ 1430
  
  // Left cluster (Spirulina):
  // Rear-Left Spirulina: center 360 -> left = 360 - spRearMeta.width/2
  // Rear-Right Spirulina: center 740 -> left = 740 - spRearMeta.width/2
  // Front-Center Spirulina: center 550 -> left = 550 - spFrontMeta.width/2

  // Right cluster (Sea Buckthorn):
  // Rear-Left Sea Buckthorn: center 1260 -> left = 1260 - sbRearMeta.width/2
  // Rear-Right Sea Buckthorn: center 1640 -> left = 1640 - sbRearMeta.width/2
  // Front-Center Sea Buckthorn: center 1450 -> left = 1450 - sbFrontMeta.width/2

  const spRL_X = Math.round(360 - spRearMeta.width / 2);
  const spRR_X = Math.round(740 - spRearMeta.width / 2);
  const spFC_X = Math.round(550 - spFrontMeta.width / 2);

  const sbRL_X = Math.round(1260 - sbRearMeta.width / 2);
  const sbRR_X = Math.round(1640 - sbRearMeta.width / 2);
  const sbFC_X = Math.round(1450 - sbFrontMeta.width / 2);

  const comp3M = [
    // 1. Rear Shadows
    { input: spRearSh.buffer, top: Math.round(yRear - spRearSh.height / 2), left: Math.round(spRL_X + (spRearMeta.width - spRearSh.width) / 2) },
    { input: spRearSh.buffer, top: Math.round(yRear - spRearSh.height / 2), left: Math.round(spRR_X + (spRearMeta.width - spRearSh.width) / 2) },
    { input: sbRearSh.buffer, top: Math.round(yRear - sbRearSh.height / 2), left: Math.round(sbRL_X + (sbRearMeta.width - sbRearSh.width) / 2) },
    { input: sbRearSh.buffer, top: Math.round(yRear - sbRearSh.height / 2), left: Math.round(sbRR_X + (sbRearMeta.width - sbRearSh.width) / 2) },

    // 2. Rear Bottles
    { input: spRear, top: yRear - spRearMeta.height, left: spRL_X },
    { input: spRear, top: yRear - spRearMeta.height, left: spRR_X },
    { input: sbRear, top: yRear - sbRearMeta.height, left: sbRL_X },
    { input: sbRear, top: yRear - sbRearMeta.height, left: sbRR_X },

    // 3. Front Shadows
    { input: spFrontSh.buffer, top: Math.round(yFront - spFrontSh.height / 2), left: Math.round(spFC_X + (spFrontMeta.width - spFrontSh.width) / 2) },
    { input: sbFrontSh.buffer, top: Math.round(yFront - sbFrontSh.height / 2), left: Math.round(sbFC_X + (sbFrontMeta.width - sbFrontSh.width) / 2) },

    // 4. Front Bottles
    { input: spFront, top: yFront - spFrontMeta.height, left: spFC_X },
    { input: sbFront, top: yFront - sbFrontMeta.height, left: sbFC_X },
  ];

  await sharp({
    create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite(comp3M)
  .jpeg({ quality: 97, chromaSubsampling: '4:4:4' })
  .toFile('public/products/sujata-combo-capsules-3month-dualtriangle.jpg');

  console.log('✅ Generated dual triangle 3M');
}

testTriangle().catch(console.error);

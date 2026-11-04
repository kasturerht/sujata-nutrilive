// scripts/test-2m-pair.mjs
import sharp from 'sharp';

async function test2MPair() {
  const CANVAS = 2000;
  const HERO_HEIGHT = 1100;
  
  const spTrimmed = 'public/products/sujata-spirulina-trimmed.png';
  const sbTrimmed = 'public/products/sujata-sea-buckthorn-trimmed.png';
  
  const spFront = await sharp(spTrimmed).resize({ height: HERO_HEIGHT }).toBuffer();
  const spFrontMeta = await sharp(spFront).metadata();
  
  const sbHeight = Math.round(HERO_HEIGHT * 0.98);
  const sbFront = await sharp(sbTrimmed).resize({ height: sbHeight }).toBuffer();
  const sbFrontMeta = await sharp(sbFront).metadata();

  const TIER2_SCALE = 0.92;
  const spTier2H = Math.round(HERO_HEIGHT * TIER2_SCALE);
  const spTier2 = await sharp(spTrimmed).resize({ height: spTier2H }).modulate({ brightness: 0.98 }).toBuffer();
  const spTier2Meta = await sharp(spTier2).metadata();

  const sbTier2H = Math.round(sbHeight * TIER2_SCALE);
  const sbTier2 = await sharp(sbTrimmed).resize({ height: sbTier2H }).modulate({ brightness: 0.98 }).toBuffer();
  const sbTier2Meta = await sharp(sbTier2).metadata();

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

  const yFront = 1600;
  const yTier2 = 1450; // 150px elevation

  // Layout A: Dual Stagger (Left: 2 Spirulina, Right: 2 Sea Buckthorn)
  // Left pair:
  // Rear Spirulina: left 180, elevated
  // Front Spirulina: left 440, ground
  // Right pair:
  // Front Sea Buckthorn: left 1000, ground
  // Rear Sea Buckthorn: left 1340, elevated

  const compA = [
    // Rear shadows
    { input: spTier2Sh.buffer, top: Math.round(yTier2 - spTier2Sh.height / 2), left: Math.round(180 + (spTier2Meta.width - spTier2Sh.width) / 2) },
    { input: sbTier2Sh.buffer, top: Math.round(yTier2 - sbTier2Sh.height / 2), left: Math.round(1340 + (sbTier2Meta.width - sbTier2Sh.width) / 2) },
    // Rear bottles
    { input: spTier2, top: yTier2 - spTier2Meta.height, left: 180 },
    { input: sbTier2, top: yTier2 - sbTier2Meta.height, left: 1340 },
    // Front shadows
    { input: spFrontSh.buffer, top: Math.round(yFront - spFrontSh.height / 2), left: Math.round(440 + (spFrontMeta.width - spFrontSh.width) / 2) },
    { input: sbFrontSh.buffer, top: Math.round(yFront - sbFrontSh.height / 2), left: Math.round(1000 + (sbFrontMeta.width - sbFrontSh.width) / 2) },
    // Front bottles
    { input: spFront, top: yFront - spFrontMeta.height, left: 440 },
    { input: sbFront, top: yFront - sbFrontMeta.height, left: 1000 },
  ];

  await sharp({
    create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite(compA)
  .jpeg({ quality: 97, chromaSubsampling: '4:4:4' })
  .toFile('public/products/sujata-combo-capsules-2month-staggered.jpg');

  console.log('✅ Generated staggered 2M');
}

test2MPair().catch(console.error);

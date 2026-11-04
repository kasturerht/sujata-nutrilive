// scripts/generate-perfect-diwali-banners.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateMasterBanners() {
  const original = 'C:/Users/Admin/.gemini/antigravity/brain/aff0f6db-617f-4f89-832a-fb17a77cad3f/untitled-design-14-original.png';
  const brainDir = 'C:/Users/Admin/.gemini/antigravity/brain/aff0f6db-617f-4f89-832a-fb17a77cad3f';
  const img = sharp(original);
  const meta = await img.metadata();

  fs.mkdirSync('public/banners', { recursive: true });

  console.log(`Original: ${meta.width} x ${meta.height}`);

  // =========================================================================
  // 1. DESKTOP ORIGINAL MASTER (Optimized for Web 2752 x 1536)
  // 100% exact pixel fidelity, zero crop, ultra-optimized for fast web loading
  // =========================================================================
  console.log('Generating Desktop Master (100% original fidelity)...');
  await img.clone()
    .jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
    .toFile('public/banners/diwali-hero-desktop-master.jpg');

  await img.clone()
    .webp({ quality: 92 })
    .toFile('public/banners/diwali-hero-desktop-master.webp');

  fs.copyFileSync('public/banners/diwali-hero-desktop-master.jpg', path.join(brainDir, 'diwali-hero-desktop-master.jpg'));
  console.log('✅ Desktop Master generated!');

  // =========================================================================
  // 2. DESKTOP WIDE HERO (Safe-Margin 2400 x 1200 - 2:1 Cinematic)
  // Perfectly fits modern website hero sections without pushing below fold
  // =========================================================================
  console.log('Generating Desktop Cinematic 2:1 Banner...');
  const cinWidth = 2400;
  const cinHeight = 1250;

  // Background with royal maroon gradient
  const cinBgSvg = Buffer.from(`
    <svg width="${cinWidth}" height="${cinHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2D060D"/>
          <stop offset="25%" stop-color="#380913"/>
          <stop offset="75%" stop-color="#380913"/>
          <stop offset="100%" stop-color="#2A050C"/>
        </linearGradient>
      </defs>
      <rect width="${cinWidth}" height="${cinHeight}" fill="url(#bg)"/>
    </svg>
  `);

  const cinContent = await img.clone()
    .resize({ width: 2200, height: cinHeight, fit: 'contain', background: { r: 56, g: 9, b: 19, alpha: 1 } })
    .toBuffer();

  const cinComposed = await sharp(cinBgSvg)
    .composite([
      { input: cinContent, top: 0, left: Math.round((cinWidth - 2200) / 2) }
    ])
    .jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
    .toBuffer();

  fs.writeFileSync('public/banners/diwali-hero-cinematic.jpg', cinComposed);
  fs.copyFileSync('public/banners/diwali-hero-cinematic.jpg', path.join(brainDir, 'diwali-hero-cinematic.jpg'));
  console.log('✅ Desktop Cinematic generated!');

  // =========================================================================
  // 3. MOBILE VERTICAL MASTER (1080 x 1650 - Seamless Vertical Art Direction)
  // Eliminates the seam line using a luxury golden decorative glow line
  // =========================================================================
  console.log('Generating Mobile Vertical Master (Seamless)...');
  const mobW = 1080;
  const mobH = 1650;

  // Hamper (Top)
  const hamper = await img.clone()
    .extract({ left: 30, top: 50, width: 1380, height: 1450 })
    .resize({ width: 1040, height: 750, fit: 'cover', position: 'bottom' })
    .toBuffer();

  // Offers (Bottom)
  const offers = await img.clone()
    .extract({ left: 1420, top: 50, width: 1300, height: 1450 })
    .resize({ width: 1000, height: 790, fit: 'contain', background: { r: 42, g: 6, b: 12, alpha: 1 } })
    .toBuffer();

  // Golden separator line SVG with soft light bloom
  const separatorSvg = Buffer.from(`
    <svg width="1000" height="40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B" stop-opacity="0"/>
          <stop offset="25%" stop-color="#F59E0B" stop-opacity="0.4"/>
          <stop offset="50%" stop-color="#FDE68A" stop-opacity="0.95"/>
          <stop offset="75%" stop-color="#F59E0B" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#F59E0B" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.8"/>
          <stop offset="40%" stop-color="#F59E0B" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect x="50" y="19" width="900" height="2" fill="url(#goldLine)"/>
      <ellipse cx="500" cy="20" rx="160" ry="12" fill="url(#centerGlow)"/>
      <!-- Small festive diamond in center -->
      <polygon points="500,14 506,20 500,26 494,20" fill="#FFFBEB"/>
    </svg>
  `);

  const mobBgSvg = Buffer.from(`
    <svg width="${mobW}" height="${mobH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mobBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#240409"/>
          <stop offset="25%" stop-color="#3A0A13"/>
          <stop offset="50%" stop-color="#4B121A"/>
          <stop offset="75%" stop-color="#360811"/>
          <stop offset="100%" stop-color="#220408"/>
        </linearGradient>
      </defs>
      <rect width="${mobW}" height="${mobH}" fill="url(#mobBg)"/>
    </svg>
  `);

  const mobComposed = await sharp(mobBgSvg)
    .composite([
      { input: hamper, top: 20, left: Math.round((mobW - 1040) / 2) },
      { input: separatorSvg, top: 765, left: Math.round((mobW - 1000) / 2) },
      { input: offers, top: 810, left: Math.round((mobW - 1000) / 2) }
    ])
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toBuffer();

  fs.writeFileSync('public/banners/diwali-hero-mobile-master.jpg', mobComposed);
  fs.copyFileSync('public/banners/diwali-hero-mobile-master.jpg', path.join(brainDir, 'diwali-hero-mobile-master.jpg'));
  console.log('✅ Mobile Master generated!');
}

generateMasterBanners().catch(console.error);

// scripts/generate-diwali-banners.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateBanners() {
  const original = 'C:/Users/Admin/.gemini/antigravity/brain/aff0f6db-617f-4f89-832a-fb17a77cad3f/untitled-design-14-original.png';
  const brainDir = 'C:/Users/Admin/.gemini/antigravity/brain/aff0f6db-617f-4f89-832a-fb17a77cad3f';
  const img = sharp(original);
  const meta = await img.metadata();

  fs.mkdirSync('public/banners', { recursive: true });

  console.log(`Original dimensions: ${meta.width} x ${meta.height}`);

  // =========================================================================
  // 1. DESKTOP WIDESCREEN MASTER (2560 x 1300 - 16:8.1 ratio)
  // Ensures safety zones around all edges so nothing is ever clipped on laptop/monitor
  // =========================================================================
  console.log('Generating Desktop Widescreen Master (diwali-hero-desktop.jpg)...');
  
  // Create an extended 2560x1300 canvas with seamless maroon background
  const deskWidth = 2560;
  const deskHeight = 1300;
  
  // Resize original with contain to maintain 100% exact fidelity without any crop
  const deskResized = await img.clone()
    .resize({
      width: deskWidth,
      height: deskHeight,
      fit: 'contain',
      background: { r: 52, g: 10, b: 16, alpha: 1 }
    })
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toBuffer();

  fs.writeFileSync('public/banners/diwali-hero-desktop.jpg', deskResized);
  fs.copyFileSync('public/banners/diwali-hero-desktop.jpg', path.join(brainDir, 'diwali-hero-desktop.jpg'));
  console.log('✅ Desktop Master generated!');

  // =========================================================================
  // 2. MOBILE VERTICAL MASTER (1080 x 1440 - 3:4 portrait)
  // Perfectly optimized for mobile phone viewports:
  // Top: Luxury Diwali Gift Hamper with diyas and bottles
  // Bottom: Sujata Emblem, Shubh Diwali typography, 3 offer cards, and CTA button
  // 100% sharp, readable, and zero crop!
  // =========================================================================
  console.log('Generating Mobile Vertical Master (diwali-hero-mobile.jpg)...');
  
  const mobWidth = 1080;
  const mobHeight = 1480;

  // Extract Hamper (Left 0 to 1420, height 1536)
  const hamperBuffer = await img.clone()
    .extract({ left: 30, top: 40, width: 1370, height: 1460 })
    .resize({ width: 1020, height: 720, fit: 'contain', background: { r: 52, g: 10, b: 16, alpha: 1 } })
    .toBuffer();

  // Extract Offers (Right 1430 to 2730, height 1460)
  const offersBuffer = await img.clone()
    .extract({ left: 1430, top: 40, width: 1290, height: 1460 })
    .resize({ width: 980, height: 720, fit: 'contain', background: { r: 52, g: 10, b: 16, alpha: 1 } })
    .toBuffer();

  // Background SVG with luxury maroon gradient
  const bgSvg = Buffer.from(`
    <svg width="${mobWidth}" height="${mobHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="maroonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#240409"/>
          <stop offset="30%" stop-color="#3A0A13"/>
          <stop offset="65%" stop-color="#4B121A"/>
          <stop offset="100%" stop-color="#26050A"/>
        </linearGradient>
        <radialGradient id="goldGlow" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.12"/>
          <stop offset="60%" stop-color="#D97706" stop-opacity="0.04"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${mobWidth}" height="${mobHeight}" fill="url(#maroonGrad)"/>
      <circle cx="540" cy="720" r="450" fill="url(#goldGlow)"/>
    </svg>
  `);

  const mobileComposed = await sharp(bgSvg)
    .composite([
      { input: hamperBuffer, top: 15, left: Math.round((mobWidth - 1020) / 2) },
      { input: offersBuffer, top: 740, left: Math.round((mobWidth - 980) / 2) }
    ])
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toBuffer();

  fs.writeFileSync('public/banners/diwali-hero-mobile.jpg', mobileComposed);
  fs.copyFileSync('public/banners/diwali-hero-mobile.jpg', path.join(brainDir, 'diwali-hero-mobile.jpg'));
  console.log('✅ Mobile Master generated!');

  // =========================================================================
  // 3. ORIGINAL WEB-OPTIMIZED (2752 x 1536)
  // Compressed for web delivery (WebP and optimized JPEG)
  // =========================================================================
  console.log('Generating Web-Optimized Original (diwali-hero-original-optimized.jpg)...');
  await img.clone()
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile('public/banners/diwali-hero-original-optimized.jpg');
    
  fs.copyFileSync('public/banners/diwali-hero-original-optimized.jpg', path.join(brainDir, 'diwali-hero-original-optimized.jpg'));
  console.log('✅ Web-Optimized Original generated!');
}

generateBanners().catch(console.error);

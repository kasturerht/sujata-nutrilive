import fs from 'fs';
const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Diwali Offer is hero-slide-0 (already 0)

// 2. Spirulina should be hero-slide-1
content = content.replace(
  `{/* -------------------------------------------------------------\r\n          SLIDE 1: PURE SPIRULINA PROTOCOL (Energy & Bio-Iron - #1 High-Intent Entry)\r\n          ------------------------------------------------------------- */}\r\n      <div \r\n        id="hero-slide-3" \r\n        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4"\r\n        data-slide-index="3"`,
  `{/* -------------------------------------------------------------\r\n          SLIDE 1: PURE SPIRULINA PROTOCOL (Energy & Bio-Iron - #1 High-Intent Entry)\r\n          ------------------------------------------------------------- */}\r\n      <div \r\n        id="hero-slide-1" \r\n        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4"\r\n        data-slide-index="1"`
);

// 3. Combo Pack should be hero-slide-2
content = content.replace(
  `{/* -------------------------------------------------------------\r\n          SLIDE 2: HEALTHY LIFE COMBO (Synergy Routine Upgrade)\r\n          ------------------------------------------------------------- */}\r\n      <div \r\n        id="hero-slide-1" \r\n        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4"\r\n        data-slide-index="1"`,
  `{/* -------------------------------------------------------------\r\n          SLIDE 2: HEALTHY LIFE COMBO (Synergy Routine Upgrade)\r\n          ------------------------------------------------------------- */}\r\n      <div \r\n        id="hero-slide-2" \r\n        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4"\r\n        data-slide-index="2"`
);

// 4. Sea Buckthorn should be hero-slide-3
content = content.replace(
  `{/* -------------------------------------------------------------\r\n          SLIDE 3: WILD SEA BUCKTHORN (Cellular Glow & Omega 7)\r\n          ------------------------------------------------------------- */}\r\n      <div \r\n        id="hero-slide-2" \r\n        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4"\r\n        data-slide-index="2"`,
  `{/* -------------------------------------------------------------\r\n          SLIDE 3: WILD SEA BUCKTHORN (Cellular Glow & Omega 7)\r\n          ------------------------------------------------------------- */}\r\n      <div \r\n        id="hero-slide-3" \r\n        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4"\r\n        data-slide-index="3"`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Corrected slide numbering!');

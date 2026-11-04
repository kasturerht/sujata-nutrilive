// scripts/implement-festive-slide-0.mjs
import fs from 'fs';

const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');

// 1. TABS REPLACEMENT
// Locate <div id="hero-protocol-tabs" ... </div>
const tabsRegex = /<div\s+id="hero-protocol-tabs"[\s\S]*?<\/div>\s*<\/div>/;

const newTabsBlock = `<div 
        id="hero-protocol-tabs" 
        class="w-full grid grid-cols-4 p-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl shadow-xl gap-0.5 sm:gap-1"
        role="tablist"
        aria-label="Flagship Protocols"
      >
        {/* Tab 0: Shubh Diwali Festive Offer */}
        <button 
          type="button" 
          role="tab" 
          aria-selected="true" 
          aria-controls="hero-slide-0"
          data-tab-index="0"
          class="hero-tab-btn active relative py-1.5 sm:py-2 px-1 sm:px-2 rounded-full text-[8px] sm:text-xs font-bold font-sans transition-all duration-300 flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer outline-none whitespace-nowrap bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-400/50"
        >
          <span class="text-amber-300 text-[11px] sm:text-sm">🪔</span>
          <span class="truncate"><span class="inline sm:hidden">Diwali</span><span class="hidden sm:inline">Diwali Offer</span></span>
          <span class="bg-amber-400 text-black text-[6.5px] sm:text-[8px] font-black uppercase px-1 py-0.5 rounded-full shadow-sm leading-none">HOT</span>
          <div class="tab-progress-line absolute bottom-0 left-1 right-1 sm:left-2 sm:right-2 h-[2px] bg-amber-400 rounded-full scale-x-0 origin-left"></div>
        </button>

        {/* Tab 1: Pure Spirulina (Primary Low-Ticket Anchor) */}
        <button 
          type="button" 
          role="tab" 
          aria-selected="false" 
          aria-controls="hero-slide-1"
          data-tab-index="1"
          class="hero-tab-btn relative py-1.5 sm:py-2 px-1 sm:px-2 rounded-full text-[8px] sm:text-xs font-bold font-sans transition-all duration-300 flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer outline-none whitespace-nowrap text-emerald-100/70 hover:text-white hover:bg-white/5 border border-transparent"
        >
          <span class="text-emerald-400 text-[11px] sm:text-sm">🌿</span>
          <span class="truncate">Spirulina</span>
          <span class="bg-emerald-400 text-black text-[6.5px] sm:text-[8px] font-black uppercase px-1 py-0.5 rounded-full shadow-sm leading-none">₹{spiriPrice}</span>
          <div class="tab-progress-line absolute bottom-0 left-1 right-1 sm:left-2 sm:right-2 h-[2px] bg-emerald-400 rounded-full scale-x-0 origin-left"></div>
        </button>

        {/* Tab 2: Synergy Combo Pack */}
        <button 
          type="button" 
          role="tab" 
          aria-selected="false" 
          aria-controls="hero-slide-2"
          data-tab-index="2"
          class="hero-tab-btn relative py-1.5 sm:py-2 px-1 sm:px-2 rounded-full text-[8px] sm:text-xs font-bold font-sans transition-all duration-300 flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer outline-none whitespace-nowrap text-emerald-100/70 hover:text-white hover:bg-white/5 border border-transparent"
        >
          <span class="text-amber-400 text-[11px] sm:text-sm">⭐</span>
          <span class="truncate"><span class="inline sm:hidden">Combo</span><span class="hidden sm:inline">Combo Pack</span></span>
          <span class="bg-amber-400 text-black text-[6.5px] sm:text-[8px] font-black uppercase px-1 py-0.5 rounded-full shadow-sm leading-none">-{comboDiscount}%</span>
          <div class="tab-progress-line absolute bottom-0 left-1 right-1 sm:left-2 sm:right-2 h-[2px] bg-amber-400 rounded-full scale-x-0 origin-left"></div>
        </button>

        {/* Tab 3: Sea Buckthorn */}
        <button 
          type="button" 
          role="tab" 
          aria-selected="false" 
          aria-controls="hero-slide-3"
          data-tab-index="3"
          class="hero-tab-btn relative py-1.5 sm:py-2 px-1 sm:px-2 rounded-full text-[8px] sm:text-xs font-bold font-sans transition-all duration-300 flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer outline-none whitespace-nowrap text-emerald-100/70 hover:text-white hover:bg-white/5 border border-transparent"
        >
          <span class="text-amber-400 text-[11px] sm:text-sm">🍊</span>
          <span class="truncate"><span class="inline sm:hidden">Sea B.</span><span class="hidden sm:inline">Sea Buckthorn</span></span>
          <div class="tab-progress-line absolute bottom-0 left-1 right-1 sm:left-2 sm:right-2 h-[2px] bg-amber-400 rounded-full scale-x-0 origin-left"></div>
        </button>
      </div>
    </div>`;

if (!tabsRegex.test(content)) {
  console.error('Tabs regex failed to match!');
  process.exit(1);
}
content = content.replace(tabsRegex, newTabsBlock);
console.log('✅ Tabs replaced successfully!');

// 2. SLIDES RE-INDEXING & INSERTING SLIDE 0
// Renumber existing slide 0 -> slide 1
content = content.replace(
  `{/* -------------------------------------------------------------\r\n          SLIDE 0: PURE SPIRULINA PROTOCOL`,
  `{/* -------------------------------------------------------------\r\n          SLIDE 1: PURE SPIRULINA PROTOCOL`
);
content = content.replace(
  `{/* -------------------------------------------------------------\n          SLIDE 0: PURE SPIRULINA PROTOCOL`,
  `{/* -------------------------------------------------------------\n          SLIDE 1: PURE SPIRULINA PROTOCOL`
);
content = content.replace(`id="hero-slide-0"`, `id="hero-slide-1"`);
content = content.replace(`data-slide-index="0"`, `data-slide-index="1"`);

// Renumber existing slide 1 -> slide 2
content = content.replace(
  `{/* -------------------------------------------------------------\r\n          SLIDE 1: HEALTHY LIFE COMBO`,
  `{/* -------------------------------------------------------------\r\n          SLIDE 2: HEALTHY LIFE COMBO`
);
content = content.replace(
  `{/* -------------------------------------------------------------\n          SLIDE 1: HEALTHY LIFE COMBO`,
  `{/* -------------------------------------------------------------\n          SLIDE 2: HEALTHY LIFE COMBO`
);
content = content.replace(`id="hero-slide-1"`, `id="hero-slide-2"`);
content = content.replace(`data-slide-index="1"`, `data-slide-index="2"`);

// Renumber existing slide 2 -> slide 3
content = content.replace(
  `{/* -------------------------------------------------------------\r\n          SLIDE 2: WILD SEA BUCKTHORN`,
  `{/* -------------------------------------------------------------\r\n          SLIDE 3: WILD SEA BUCKTHORN`
);
content = content.replace(
  `{/* -------------------------------------------------------------\n          SLIDE 2: WILD SEA BUCKTHORN`,
  `{/* -------------------------------------------------------------\n          SLIDE 3: WILD SEA BUCKTHORN`
);
content = content.replace(`id="hero-slide-2"`, `id="hero-slide-3"`);
content = content.replace(`data-slide-index="2"`, `data-slide-index="3"`);

// Now insert SLIDE 0 right after <div id="hero-slider-track" ... >
const trackMarker = content.indexOf('id="hero-slider-track"');
const trackOpeningEnd = content.indexOf('>', trackMarker) + 1;

const slide0Snippet = `\r\n      {/* -------------------------------------------------------------\r\n          SLIDE 0: 🪔 SHUBH DIWALI FESTIVE OFFER (True Aspect Ratio Master)\r\n          ------------------------------------------------------------- */}\r\n      <div \r\n        id="hero-slide-0" \r\n        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4 flex items-center justify-center py-2 sm:py-4"\r\n        data-slide-index="0"\r\n      >\r\n        <div class="w-full max-w-5xl mx-auto flex flex-col items-center justify-center">\r\n          <a \r\n            href={\`/product/\${comboHandle}\`} \r\n            title="Claim Shubh Diwali Festive Offers - Sujata Nutrilive" \r\n            class="block relative w-full group overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/40 shadow-[0_12px_40px_rgba(245,158,11,0.25)] hover:shadow-[0_18px_50px_rgba(245,158,11,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-400 bg-[#240409]"\r\n          >\r\n            <picture class="block w-full">\r\n              {/* 1. Mobile Screen (< 640px): Dedicated Vertical Master (96 KB WebP, 1080x1650, Exact Vertical Aspect Ratio) */}\r\n              <source \r\n                media="(max-width: 639px)" \r\n                srcset="/banners/diwali-hero-mobile-750.webp 1x, /banners/diwali-hero-mobile-master.webp 2x" \r\n                type="image/webp" \r\n              />\r\n              <source \r\n                media="(max-width: 639px)" \r\n                srcset="/banners/diwali-hero-mobile-master.jpg" \r\n              />\r\n\r\n              {/* 2. Tablet Screen (640px - 1023px): Cinematic Safe-Margin 2:1 */}\r\n              <source \r\n                media="(max-width: 1023px)" \r\n                srcset="/banners/diwali-hero-cinematic.jpg" \r\n              />\r\n\r\n              {/* 3. Desktop Screen (>= 1024px): 16:9 Widescreen Master WebP */}\r\n              <source \r\n                media="(min-width: 1024px)" \r\n                srcset="/banners/diwali-hero-desktop-master.webp" \r\n                type="image/webp" \r\n              />\r\n              <source \r\n                media="(min-width: 1024px)" \r\n                srcset="/banners/diwali-hero-desktop-master.jpg" \r\n              />\r\n\r\n              {/* 100% True Ratio Image: object-contain with max-h guarantees zero crop, zero stretch, zero distortion */}\r\n              <img \r\n                src="/banners/diwali-hero-desktop-master.jpg" \r\n                alt="Sujata Nutrilive Shubh Diwali Festive Offers - 1-Month, 2-Month & 3-Month Spirulina & Sea Buckthorn Combo Hampers" \r\n                class="w-full h-auto max-h-[580px] object-contain block mx-auto transition-transform duration-700 ease-out group-hover:scale-[1.01]"\r\n                loading="eager"\r\n                fetchpriority="high"\r\n                decoding="async"\r\n                width="2752"\r\n                height="1536"\r\n              />\r\n            </picture>\r\n\r\n            {/* Subtle ambient golden sheen */}\r\n            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>\r\n          </a>\r\n        </div>\r\n      </div>\r\n`;

content = content.substring(0, trackOpeningEnd) + slide0Snippet + content.substring(trackOpeningEnd);
console.log('✅ Slide 0 inserted successfully!');

// 3. DOT INDICATORS: Replace 3 dots with 4 dots
const dotsRegex = /<div class="flex items-center justify-center gap-2 mt-3 sm:mt-4">[\s\S]*?<\/div>/;
const newDotsBlock = `<div class="flex items-center justify-center gap-2 mt-3 sm:mt-4">
      <button 
        type="button" 
        class="hero-dot-indicator w-6 h-1.5 rounded-full bg-amber-400 transition-all duration-300 cursor-pointer" 
        data-dot-index="0" 
        aria-label="Go to slide 1 (Diwali Offer)"
      ></button>
      <button 
        type="button" 
        class="hero-dot-indicator w-2 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-all duration-300 cursor-pointer" 
        data-dot-index="1" 
        aria-label="Go to slide 2 (Spirulina)"
      ></button>
      <button 
        type="button" 
        class="hero-dot-indicator w-2 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-all duration-300 cursor-pointer" 
        data-dot-index="2" 
        aria-label="Go to slide 3 (Combo Pack)"
      ></button>
      <button 
        type="button" 
        class="hero-dot-indicator w-2 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-all duration-300 cursor-pointer" 
        data-dot-index="3" 
        aria-label="Go to slide 4 (Sea Buckthorn)"
      ></button>
    </div>`;

if (!dotsRegex.test(content)) {
  console.error('Dots regex failed to match!');
  process.exit(1);
}
content = content.replace(dotsRegex, newDotsBlock);
console.log('✅ Dots replaced successfully!');

// 4. SCRIPT UPDATE (glowColors and updateUI)
const oldGlowColors = `    const glowColors = [
      'rgba(16, 185, 129, 0.16)', // Spirulina (Luminous Emerald) - index 0
      'rgba(245, 158, 11, 0.14)', // Combo (Warm Amber Gold) - index 1
      'rgba(217, 119, 6, 0.15)',  // Sea Buckthorn (Himalayan Amber) - index 2
    ];`;

const newGlowColors = `    const glowColors = [
      'rgba(245, 158, 11, 0.20)', // Diwali Offer (Warm Amber Gold) - index 0
      'rgba(16, 185, 129, 0.16)', // Spirulina (Luminous Emerald) - index 1
      'rgba(245, 158, 11, 0.14)', // Combo (Warm Amber Gold) - index 2
      'rgba(217, 119, 6, 0.15)',  // Sea Buckthorn (Himalayan Amber) - index 3
    ];`;

content = content.replace(oldGlowColors, newGlowColors);

// Update updateUI in script
const oldTabUpdate = `        if (isCurrent) {
          btn.classList.add('active', 'bg-[#064E3B]', 'text-white', 'shadow-md', 'border-emerald-400/40');
          btn.classList.remove('text-emerald-100/70', 'border-transparent');
          if (progressLine) {
            progressLine.style.transition = 'none';
            progressLine.style.transform = 'scaleX(0)';
            setTimeout(() => {
              progressLine.style.transition = \`transform \${SLIDE_DURATION}ms linear\`;
              progressLine.style.transform = 'scaleX(1)';
            }, 30);
          }
        } else {
          btn.classList.remove('active', 'bg-[#064E3B]', 'text-white', 'shadow-md', 'border-emerald-400/40');
          btn.classList.add('text-emerald-100/70', 'border-transparent');
          if (progressLine) {
            progressLine.style.transition = 'none';
            progressLine.style.transform = 'scaleX(0)';
          }
        }`;

const newTabUpdate = `        if (isCurrent) {
          if (idx === 0) {
            btn.classList.add('active', 'bg-gradient-to-r', 'from-amber-600', 'to-amber-700', 'text-white', 'shadow-md', 'border-amber-400/50');
            btn.classList.remove('bg-[#064E3B]', 'border-emerald-400/40', 'text-emerald-100/70', 'border-transparent');
          } else {
            btn.classList.add('active', 'bg-[#064E3B]', 'text-white', 'shadow-md', 'border-emerald-400/40');
            btn.classList.remove('bg-gradient-to-r', 'from-amber-600', 'to-amber-700', 'border-amber-400/50', 'text-emerald-100/70', 'border-transparent');
          }
          if (progressLine) {
            progressLine.style.transition = 'none';
            progressLine.style.transform = 'scaleX(0)';
            setTimeout(() => {
              progressLine.style.transition = \`transform \${SLIDE_DURATION}ms linear\`;
              progressLine.style.transform = 'scaleX(1)';
            }, 30);
          }
        } else {
          btn.classList.remove('active', 'bg-[#064E3B]', 'bg-gradient-to-r', 'from-amber-600', 'to-amber-700', 'text-white', 'shadow-md', 'border-emerald-400/40', 'border-amber-400/50');
          btn.classList.add('text-emerald-100/70', 'border-transparent');
          if (progressLine) {
            progressLine.style.transition = 'none';
            progressLine.style.transform = 'scaleX(0)';
          }
        }`;

content = content.replace(oldTabUpdate, newTabUpdate);

const oldDotUpdate = `        if (isCurrent) {
          dot.className = currentIndex === 0
            ? 'hero-dot-indicator w-6 h-1.5 rounded-full bg-emerald-400 transition-all duration-300 cursor-pointer'
            : 'hero-dot-indicator w-6 h-1.5 rounded-full bg-amber-400 transition-all duration-300 cursor-pointer';
        }`;

const newDotUpdate = `        if (isCurrent) {
          dot.className = (currentIndex === 0 || currentIndex === 2)
            ? 'hero-dot-indicator w-6 h-1.5 rounded-full bg-amber-400 transition-all duration-300 cursor-pointer'
            : 'hero-dot-indicator w-6 h-1.5 rounded-full bg-emerald-400 transition-all duration-300 cursor-pointer';
        }`;

content = content.replace(oldDotUpdate, newDotUpdate);

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 Successfully implemented Festive Slide 0 in StoreHero.astro!');

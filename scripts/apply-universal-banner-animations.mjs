import fs from 'fs';

const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. UPDATE SLIDE 1 (Spirulina)
const slide1VisualOld = `<div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative w-full py-1">
            <div class="absolute w-[200px] sm:w-[280px] lg:w-[340px] h-[200px] sm:h-[280px] lg:h-[340px] bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>`;

const slide1VisualNew = `<div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative w-full py-1 hero-reveal-elem hero-reveal-visual">
            <div class="absolute w-[200px] sm:w-[280px] lg:w-[340px] h-[200px] sm:h-[280px] lg:h-[340px] bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>`;

const slide1TagOld = `<span class="inline-flex items-center gap-1.5 text-[9.5px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 mb-2">`;
const slide1TagNew = `<span class="hero-reveal-elem hero-reveal-tag inline-flex items-center gap-1.5 text-[9.5px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 mb-2">`;

const slide1HeadingOld = `<h1 class="text-xl sm:text-3xl lg:text-[2.5rem] xl:text-[2.85rem] font-serif font-normal text-white leading-[1.15] tracking-tight mb-1.5 sm:mb-2">`;
const slide1HeadingNew = `<h1 class="hero-reveal-elem hero-reveal-heading text-xl sm:text-3xl lg:text-[2.5rem] xl:text-[2.85rem] font-serif font-normal text-white leading-[1.15] tracking-tight mb-1.5 sm:mb-2">`;

const slide1DescOld = `<p class="text-xs sm:text-sm text-emerald-100/80 font-normal leading-relaxed max-w-xl mb-2 sm:mb-3 font-sans">
              100% Pure, sub-40°C cold-pressed Spirulina. Packed with 290.89 mg/kg natural iron (as Fe), 62.39% plant protein (IS 7219), and active Phycocyanin. Wake up refreshed and energized all day without caffeine crashes.
            </p>`;
const slide1DescNew = `<p class="hero-reveal-elem hero-reveal-desc text-xs sm:text-sm text-emerald-100/80 font-normal leading-relaxed max-w-xl mb-2 sm:mb-3 font-sans">
              100% Pure, sub-40°C cold-pressed Spirulina. Packed with 290.89 mg/kg natural iron (as Fe), 62.39% plant protein (IS 7219), and active Phycocyanin. Wake up refreshed and energized all day without caffeine crashes.
            </p>`;

const slide1PillsOld = `<div class="grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-md mb-2.5 sm:mb-3 text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">🟢</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">100% Pure Veg</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">🌿</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">Zero Fishy Odour</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">⚡</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">290.89 mg/kg Fe</span>
              </div>
            </div>`;
const slide1PillsNew = `<div class="hero-reveal-elem hero-reveal-pills grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-md mb-2.5 sm:mb-3 text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">🟢</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">100% Pure Veg</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">🌿</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">Zero Fishy Odour</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">⚡</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">290.89 mg/kg Fe</span>
              </div>
            </div>`;

const slide1PriceOld = `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 w-full max-w-md shadow-inner">
              <div class="flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">₹{spiriPrice.toLocaleString('en-IN')}</span>`;
const slide1PriceNew = `<div class="hero-reveal-elem hero-reveal-price flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 w-full max-w-md shadow-inner">
              <div class="flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">₹{spiriPrice.toLocaleString('en-IN')}</span>`;

const slide1CtaOld = `<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mb-2">
              <a 
                href={\`/product/\${spiriHandle}\`} 
                class="bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-[0_6px_20px_rgba(52,211,153,0.35)] transition-all active:scale-95 text-center font-sans flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >`;
const slide1CtaNew = `<div class="hero-reveal-elem hero-reveal-cta flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mb-2">
              <a 
                href={\`/product/\${spiriHandle}\`} 
                class="btn-emerald-sweep bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-[0_6px_20px_rgba(52,211,153,0.35)] transition-all active:scale-95 text-center font-sans flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >`;

const slide1TrustOld = `<div class="flex flex-wrap items-center justify-center lg:justify-start gap-x-2.5 gap-y-1 text-[10px] sm:text-[11px] font-semibold text-emerald-200/90 font-sans">
              <span class="flex items-center gap-1"><span class="text-amber-400">⚡</span> Extra 10% UPI Off</span>
              <span class="text-white/25">•</span>
              <span class="flex items-center gap-1"><span class="text-emerald-400">💵</span> Free Cash on Delivery</span>
              <span class="text-white/25">•</span>
              <span class="flex items-center gap-1"><span class="text-blue-400">🚚</span> 24h Express Dispatch</span>
              <span class="text-white/25">•</span>
              <span class="flex items-center gap-1"><span class="text-amber-400">🛡️</span> 90-Day Guarantee</span>
            </div>`;
const slide1TrustNew = `<div class="hero-reveal-elem hero-reveal-trust flex flex-wrap items-center justify-center lg:justify-start gap-x-2.5 gap-y-1 text-[10px] sm:text-[11px] font-semibold text-emerald-200/90 font-sans">
              <span class="flex items-center gap-1"><span class="text-amber-400">⚡</span> Extra 10% UPI Off</span>
              <span class="text-white/25">•</span>
              <span class="flex items-center gap-1"><span class="text-emerald-400">💵</span> Free Cash on Delivery</span>
              <span class="text-white/25">•</span>
              <span class="flex items-center gap-1"><span class="text-blue-400">🚚</span> 24h Express Dispatch</span>
              <span class="text-white/25">•</span>
              <span class="flex items-center gap-1"><span class="text-amber-400">🛡️</span> 90-Day Guarantee</span>
            </div>`;

// 2. UPDATE SLIDE 2 (Combo Pack)
const slide2VisualOld = `<div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative w-full py-1">
            <div class="absolute w-[200px] sm:w-[280px] lg:w-[340px] h-[200px] sm:h-[280px] lg:h-[340px] bg-amber-500/15 rounded-full blur-[60px] pointer-events-none"></div>`;
const slide2VisualNew = `<div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative w-full py-1 hero-reveal-elem hero-reveal-visual">
            <div class="absolute w-[200px] sm:w-[280px] lg:w-[340px] h-[200px] sm:h-[280px] lg:h-[340px] bg-amber-500/15 rounded-full blur-[60px] pointer-events-none"></div>`;

const slide2HeadingOld = `<h2 class="text-xl sm:text-3xl lg:text-[2.5rem] xl:text-[2.85rem] font-serif font-normal text-white leading-[1.15] tracking-tight mb-1.5 sm:mb-2">
              All-Day Natural Energy & Radiant Skin.<br/>
              <span class="italic text-amber-300 font-serif">Spirulina + Himalayan Sea Buckthorn.</span>
            </h2>`;
const slide2HeadingNew = `<h2 class="hero-reveal-elem hero-reveal-heading text-xl sm:text-3xl lg:text-[2.5rem] xl:text-[2.85rem] font-serif font-normal text-white leading-[1.15] tracking-tight mb-1.5 sm:mb-2">
              All-Day Natural Energy & Radiant Skin.<br/>
              <span class="italic text-amber-300 font-serif">Spirulina + Himalayan Sea Buckthorn.</span>
            </h2>`;

const slide2DescOld = `<p class="text-xs sm:text-sm text-emerald-100/80 font-normal leading-relaxed max-w-xl mb-2 sm:mb-3 font-sans">
              India's purest cold-pressed Spirulina (natural plant iron & 62.39% plant protein) paired with wild Ladakh Sea Buckthorn (rare Omega 7 & 12x Vitamin C). Fixes 3 PM fatigue, boosts daily stamina, and nourishes skin from within.
            </p>`;
const slide2DescNew = `<p class="hero-reveal-elem hero-reveal-desc text-xs sm:text-sm text-emerald-100/80 font-normal leading-relaxed max-w-xl mb-2 sm:mb-3 font-sans">
              India's purest cold-pressed Spirulina (natural plant iron & 62.39% plant protein) paired with wild Ladakh Sea Buckthorn (rare Omega 7 & 12x Vitamin C). Fixes 3 PM fatigue, boosts daily stamina, and nourishes skin from within.
            </p>`;

const slide2PillsOld = `<div class="grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-md mb-2.5 sm:mb-3 text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">🟢</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">100% Pure Veg</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">⚡</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">290.89 mg/kg Fe</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">🧪</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">NABL Lab Tested</span>
              </div>
            </div>`;
const slide2PillsNew = `<div class="hero-reveal-elem hero-reveal-pills grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-md mb-2.5 sm:mb-3 text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">🟢</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">100% Pure Veg</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">⚡</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">290.89 mg/kg Fe</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-emerald-400 text-[10px] sm:text-xs">🧪</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">NABL Lab Tested</span>
              </div>
            </div>`;

const slide2PriceOld = `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 w-full max-w-md shadow-inner">
              <div class="flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">₹{comboPrice.toLocaleString('en-IN')}</span>`;
const slide2PriceNew = `<div class="hero-reveal-elem hero-reveal-price flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 w-full max-w-md shadow-inner">
              <div class="flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">₹{comboPrice.toLocaleString('en-IN')}</span>`;

const slide2CtaOld = `<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mb-2">
              <a 
                href={\`/product/\${comboHandle}\`} 
                class="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-all active:scale-95 text-center font-sans flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >`;
const slide2CtaNew = `<div class="hero-reveal-elem hero-reveal-cta flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mb-2">
              <a 
                href={\`/product/\${comboHandle}\`} 
                class="btn-gold-sweep bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-all active:scale-95 text-center font-sans flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >`;

const slide2TrustOld = slide1TrustOld; // They use identical trust strips
// Will be replaced via targeted section replace

// 3. UPDATE SLIDE 3 (Sea Buckthorn)
const slide3VisualOld = `<div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative w-full py-1">
            <div class="absolute w-[200px] sm:w-[280px] lg:w-[340px] h-[200px] sm:h-[280px] lg:h-[340px] bg-amber-500/20 rounded-full blur-[60px] pointer-events-none"></div>`;
const slide3VisualNew = `<div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative w-full py-1 hero-reveal-elem hero-reveal-visual">
            <div class="absolute w-[200px] sm:w-[280px] lg:w-[340px] h-[200px] sm:h-[280px] lg:h-[340px] bg-amber-500/20 rounded-full blur-[60px] pointer-events-none"></div>`;

const slide3HeadingOld = `<h2 class="text-xl sm:text-3xl lg:text-[2.5rem] xl:text-[2.85rem] font-serif font-normal text-white leading-[1.15] tracking-tight mb-1.5 sm:mb-2">
              Radiant Skin Glow & Cellular Youth.<br/>
              <span class="italic text-amber-400 font-serif">Powered by Wild Himalayan Omega-7.</span>
            </h2>`;
const slide3HeadingNew = `<h2 class="hero-reveal-elem hero-reveal-heading text-xl sm:text-3xl lg:text-[2.5rem] xl:text-[2.85rem] font-serif font-normal text-white leading-[1.15] tracking-tight mb-1.5 sm:mb-2">
              Radiant Skin Glow & Cellular Youth.<br/>
              <span class="italic text-amber-400 font-serif">Powered by Wild Himalayan Omega-7.</span>
            </h2>`;

const slide3DescOld = `<p class="text-xs sm:text-sm text-emerald-100/80 font-normal leading-relaxed max-w-xl mb-2 sm:mb-3 font-sans">
              Nature's rarest source of Omega 7, 3, 6, 9 with 12x Vitamin C of fresh oranges. Deeply hydrates cellular mucosal linings, supports heart elasticity, and restores clear skin glow naturally.
            </p>`;
const slide3DescNew = `<p class="hero-reveal-elem hero-reveal-desc text-xs sm:text-sm text-emerald-100/80 font-normal leading-relaxed max-w-xl mb-2 sm:mb-3 font-sans">
              Nature's rarest source of Omega 7, 3, 6, 9 with 12x Vitamin C of fresh oranges. Deeply hydrates cellular mucosal linings, supports heart elasticity, and restores clear skin glow naturally.
            </p>`;

const slide3PillsOld = `<div class="grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-md mb-2.5 sm:mb-3 text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-amber-400 text-[10px] sm:text-xs">💧</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">Skin Hydration</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-amber-400 text-[10px] sm:text-xs">❤️</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">Heart Health</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-amber-400 text-[10px] sm:text-xs">🍊</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">12x Vit C</span>
              </div>
            </div>`;
const slide3PillsNew = `<div class="hero-reveal-elem hero-reveal-pills grid grid-cols-3 gap-1 sm:gap-2 w-full max-w-md mb-2.5 sm:mb-3 text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-amber-400 text-[10px] sm:text-xs">💧</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">Skin Hydration</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-amber-400 text-[10px] sm:text-xs">❤️</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">Heart Health</span>
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 sm:px-2 py-1">
                <span class="text-amber-400 text-[10px] sm:text-xs">🍊</span>
                <span class="text-[8.5px] sm:text-[11px] font-bold text-emerald-100 font-sans whitespace-nowrap">12x Vit C</span>
              </div>
            </div>`;

const slide3PriceOld = `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 w-full max-w-md shadow-inner">
              <div class="flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">₹{sbtPrice.toLocaleString('en-IN')}</span>`;
const slide3PriceNew = `<div class="hero-reveal-elem hero-reveal-price flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 w-full max-w-md shadow-inner">
              <div class="flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">₹{sbtPrice.toLocaleString('en-IN')}</span>`;

const slide3CtaOld = `<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mb-2">
              <a 
                href={\`/product/\${sbtHandle}\`} 
                class="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-all active:scale-95 text-center font-sans flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >`;
const slide3CtaNew = `<div class="hero-reveal-elem hero-reveal-cta flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mb-2">
              <a 
                href={\`/product/\${sbtHandle}\`} 
                class="btn-gold-sweep bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-all active:scale-95 text-center font-sans flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >`;

// Perform replacements sequentially
const replacements = [
  // Slide 1
  [slide1VisualOld, slide1VisualNew],
  [slide1TagOld, slide1TagNew],
  [slide1HeadingOld, slide1HeadingNew],
  [slide1DescOld, slide1DescNew],
  [slide1PillsOld, slide1PillsNew],
  [slide1PriceOld, slide1PriceNew],
  [slide1CtaOld, slide1CtaNew],
  [slide1TrustOld, slide1TrustNew],

  // Slide 2
  [slide2VisualOld, slide2VisualNew],
  [slide2HeadingOld, slide2HeadingNew],
  [slide2DescOld, slide2DescNew],
  [slide2PillsOld, slide2PillsNew],
  [slide2PriceOld, slide2PriceNew],
  [slide2CtaOld, slide2CtaNew],

  // Slide 3
  [slide3VisualOld, slide3VisualNew],
  [slide3HeadingOld, slide3HeadingNew],
  [slide3DescOld, slide3DescNew],
  [slide3PillsOld, slide3PillsNew],
  [slide3PriceOld, slide3PriceNew],
  [slide3CtaOld, slide3CtaNew]
];

for (const [target, repl] of replacements) {
  if (!content.includes(target)) {
    console.error('Target not found:', target.slice(0, 60));
    process.exit(1);
  }
  content = content.replace(target, repl);
}

// Also replace the remaining trust strips for Slide 2 and Slide 3
// Let's replace the last 2 occurrences of slide1TrustOld with slide1TrustNew
while (content.includes(slide1TrustOld)) {
  content = content.replace(slide1TrustOld, slide1TrustNew);
}

// 4. UPDATE SCRIPT: Universal re-trigger for all slides
const oldScriptReveal = `      // 4. Staggered Entrance Reveal for Diwali Slide (Slide 0)
      const slide0 = document.getElementById('hero-slide-0');
      if (slide0) {
        if (targetIndex === 0) {
          slide0.classList.remove('active-reveal', 'reveal-done');
          void slide0.offsetWidth; // Force CSS reflow to cleanly re-trigger the reveal sequence
          slide0.classList.add('active-reveal');
          if (slide0Timeout) clearTimeout(slide0Timeout);
          slide0Timeout = setTimeout(() => {
            if (currentIndex === 0) {
              slide0.classList.remove('active-reveal');
              slide0.classList.add('reveal-done');
            }
          }, 1350);
        } else {
          slide0.classList.remove('active-reveal', 'reveal-done');
          if (slide0Timeout) clearTimeout(slide0Timeout);
        }
      }`;

const newScriptReveal = `      // 4. Staggered Entrance Reveal for ALL Protocols/Banners (Slide 0, 1, 2, 3)
      slides.forEach((slide, idx) => {
        if (idx === targetIndex) {
          slide.classList.remove('active-reveal', 'reveal-done');
          void slide.offsetWidth; // Force CSS reflow to cleanly trigger entrance reveal
          slide.classList.add('active-reveal');
        } else {
          slide.classList.remove('active-reveal', 'reveal-done');
        }
      });

      if (slide0Timeout) clearTimeout(slide0Timeout);
      slide0Timeout = setTimeout(() => {
        const activeSlide = slides[currentIndex];
        if (activeSlide) {
          activeSlide.classList.remove('active-reveal');
          activeSlide.classList.add('reveal-done');
        }
      }, 1350);`;

if (!content.includes(oldScriptReveal)) {
  console.error('Error finding oldScriptReveal');
  process.exit(1);
}
content = content.replace(oldScriptReveal, newScriptReveal);

// 5. UPDATE STYLES: Add Universal Reveal Classes & Emerald Sweep
const oldStyleTarget = `  /* GPU-Accelerated Staggered Entrance (Pure CSS) */`;

const newStyleAddition = `  /* 🌿 EMERALD SHEEN SWEEP ON SPIRULINA CTA */
  .btn-emerald-sweep {
    position: relative;
    overflow: hidden;
  }
  .btn-emerald-sweep::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      105deg,
      transparent 35%,
      rgba(255, 255, 255, 0.45) 45%,
      rgba(167, 243, 208, 0.65) 50%,
      transparent 55%
    );
    transform: translateX(-100%) skewX(-20deg);
    animation: goldSheenSweep 4.2s ease-in-out infinite;
    pointer-events: none;
  }

  /* 🌟 UNIVERSAL PROTOCOL STAGGERED ENTRANCE REVEAL (SLIDES 1, 2, 3) */
  @keyframes slideVisualReveal {
    0% {
      opacity: 0;
      transform: translate3d(0, 22px, 0) scale(0.93);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes slideElemFadeUp {
    0% {
      opacity: 0;
      transform: translate3d(0, 16px, 0);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes slideCardCascade {
    0% {
      opacity: 0;
      transform: translate3d(0, 20px, 0) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes slideCtaGlideIn {
    0% {
      opacity: 0;
      transform: translate3d(0, 18px, 0) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  /* When any slide has .active-reveal, stagger its elements */
  .hero-slide-card.active-reveal .hero-reveal-elem {
    opacity: 0;
    animation-fill-mode: forwards;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }

  .hero-slide-card.active-reveal .hero-reveal-visual {
    animation-name: slideVisualReveal;
    animation-duration: 0.65s;
    animation-delay: 0.06s;
  }

  .hero-slide-card.active-reveal .hero-reveal-tag {
    animation-name: slideElemFadeUp;
    animation-duration: 0.50s;
    animation-delay: 0.16s;
  }

  .hero-slide-card.active-reveal .hero-reveal-heading {
    animation-name: slideElemFadeUp;
    animation-duration: 0.55s;
    animation-delay: 0.24s;
  }

  .hero-slide-card.active-reveal .hero-reveal-desc {
    animation-name: slideElemFadeUp;
    animation-duration: 0.50s;
    animation-delay: 0.34s;
  }

  .hero-slide-card.active-reveal .hero-reveal-pills {
    animation-name: slideCardCascade;
    animation-duration: 0.50s;
    animation-delay: 0.44s;
  }

  .hero-slide-card.active-reveal .hero-reveal-price {
    animation-name: slideElemFadeUp;
    animation-duration: 0.50s;
    animation-delay: 0.54s;
  }

  .hero-slide-card.active-reveal .hero-reveal-cta {
    animation-name: slideCtaGlideIn;
    animation-duration: 0.52s;
    animation-delay: 0.64s;
  }

  .hero-slide-card.active-reveal .hero-reveal-trust {
    animation-name: slideElemFadeUp;
    animation-duration: 0.45s;
    animation-delay: 0.74s;
  }

  /* Unlock native hover transformations once reveal completes */
  .hero-slide-card.reveal-done .hero-reveal-elem {
    opacity: 1;
    transform: none;
    animation: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-slide-card.active-reveal .hero-reveal-elem {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }

  /* GPU-Accelerated Staggered Entrance (Pure CSS) */`;

if (!content.includes(oldStyleTarget)) {
  console.error('Error finding oldStyleTarget');
  process.exit(1);
}
content = content.replace(oldStyleTarget, newStyleAddition);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: All 4 Hero banners now have cinematic staggered reveal animations!');

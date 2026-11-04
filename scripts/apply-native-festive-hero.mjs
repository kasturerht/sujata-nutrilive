// scripts/apply-native-festive-hero.mjs
import fs from 'fs';

const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');

// 1. UPDATE TABS CONTAINER TO AVOID TRUNCATION
const oldTabsRegex = /<div\s+class="w-full max-w-md mx-auto mb-3 sm:mb-5 px-1 sm:px-0 flex justify-center">[\s\S]*?<\/div>\s*<\/div>/;

const newTabsBlock = `<div class="w-full max-w-lg sm:max-w-2xl mx-auto mb-3 sm:mb-5 px-1 sm:px-0 flex justify-center">
      <div 
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
          <span class="hidden sm:inline">Diwali Offer</span>
          <span class="inline sm:hidden">Diwali</span>
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
          <span class="hidden sm:inline">Spirulina</span>
          <span class="inline sm:hidden">Spiri</span>
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
          <span class="hidden sm:inline">Combo Pack</span>
          <span class="inline sm:hidden">Combo</span>
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
          <span class="hidden sm:inline">Sea Buckthorn</span>
          <span class="inline sm:hidden">Sea B.</span>
          <div class="tab-progress-line absolute bottom-0 left-1 right-1 sm:left-2 sm:right-2 h-[2px] bg-amber-400 rounded-full scale-x-0 origin-left"></div>
        </button>
      </div>
    </div>`;

if (oldTabsRegex.test(content)) {
  content = content.replace(oldTabsRegex, newTabsBlock);
  console.log('✅ Tabs container updated with responsive no-truncate width!');
} else {
  console.warn('⚠️ Could not match oldTabsRegex');
}

// 2. REPLACE SLIDE 0 WITH NATIVE 2-COLUMN LUXURY FESTIVE SLIDE
const slide0Regex = /\{\/\*\s*-------------------------------------------------------------\s*SLIDE 0: 🪔 SHUBH DIWALI FESTIVE OFFER[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newSlide0Block = `{/* -------------------------------------------------------------
          SLIDE 0: 🪔 SHUBH DIWALI FESTIVE OFFER (Native 2-Column Luxury Slide)
          ------------------------------------------------------------- */}
      <div 
        id="hero-slide-0" 
        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4"
        data-slide-index="0"
      >
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-10 items-center">
          
          {/* Visual: On Mobile = Order 1 (TOP), On Desktop = Order 2 (RIGHT) */}
          <div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative w-full py-1">
            <div class="absolute w-[220px] sm:w-[300px] lg:w-[380px] h-[220px] sm:h-[300px] lg:h-[380px] bg-amber-500/25 rounded-full blur-[70px] pointer-events-none"></div>

            {/* Floating Festive Trust Pill */}
            <div class="relative z-20 mb-2 bg-gradient-to-r from-[#3A0A13]/90 via-[#4A0E1A]/90 to-[#2A050C]/90 backdrop-blur-md border border-amber-400/40 px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
              <span class="text-amber-400 text-xs">🪔</span>
              <span class="text-[9px] sm:text-[10.5px] font-bold tracking-wider text-amber-200 uppercase font-sans">Royal Shubh Diwali Luxury Gift Hamper</span>
            </div>

            {/* Hamper Image (Diwali Hamper Showcase) */}
            <div class="relative z-10 flex flex-col items-center justify-center group">
              <a href={\`/product/\${comboHandle}\`} title="Claim Diwali Gift Hamper" class="block cursor-pointer">
                <img 
                  src="/banners/diwali-hamper-showcase.webp" 
                  alt="Sujata Nutrilive Shubh Diwali Festive Gift Hamper with Spirulina, Sea Buckthorn, Chikki and Handmade Soaps" 
                  class="h-[200px] sm:h-[260px] md:h-[310px] lg:h-[350px] w-auto object-contain rounded-2xl sm:rounded-3xl border border-amber-500/40 shadow-[0_15px_35px_rgba(0,0,0,0.7)] group-hover:scale-105 group-hover:border-amber-400 transition-all duration-500 ease-out"
                  loading="eager"
                  fetchpriority="high"
                />
              </a>
              <div class="w-3/4 h-3 bg-black/70 rounded-[100%] blur-md -mt-1.5 pointer-events-none"></div>
            </div>
          </div>

          {/* Copy & Offers: On Mobile = Order 2 (BOTTOM), On Desktop = Order 1 (LEFT) */}
          <div class="order-2 lg:order-1 lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Top Brand Tag */}
            <span class="inline-flex items-center gap-1.5 text-[9px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40 mb-2 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Sujata Nutrilive • Shubh Diwali Celebration
            </span>

            {/* Festive Headline */}
            <h1 class="text-2xl sm:text-3xl lg:text-[2.6rem] xl:text-[2.9rem] font-serif font-normal leading-[1.15] tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400">
              SHUBH DIWALI<br/>
              <span class="italic font-serif text-amber-300">FESTIVE OFFERS</span>
            </h1>

            {/* Extra 10% Prepaid Pill */}
            <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[9.5px] sm:text-xs font-bold tracking-wider uppercase mb-2.5 sm:mb-3 shadow-inner">
              <span>✨</span>
              <span>EXTRA 10% OFF ON PREPAID ORDERS</span>
            </div>

            {/* 3 Festive Offer Cards (Exact 1:1 Match to Untitled design 14) */}
            <div class="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full max-w-md sm:max-w-lg mb-3">
              
              {/* Card 1: 1-Month Pack */}
              <div class="relative bg-gradient-to-b from-[#3A0A13]/90 to-[#220408]/90 border border-amber-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center transition-all hover:border-amber-400 hover:scale-[1.02] shadow-md">
                <div>
                  <span class="text-[8.5px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wide block">1-Month Pack</span>
                  <span class="text-[7px] sm:text-[9px] text-amber-100/70 block mt-0.5 leading-tight">Spirulina & Sea Buckthorn</span>
                </div>
                <div class="mt-1.5 pt-1 border-t border-amber-500/20">
                  <span class="text-sm sm:text-lg font-black text-white font-sans">₹1,050</span>
                </div>
              </div>

              {/* Card 2: 2-Month Pack */}
              <div class="relative bg-gradient-to-b from-[#3A0A13]/90 to-[#220408]/90 border border-amber-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center transition-all hover:border-amber-400 hover:scale-[1.02] shadow-md">
                <div>
                  <span class="text-[8.5px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wide block">2-Month Pack</span>
                  <span class="text-[7px] sm:text-[9px] text-amber-300 font-semibold block mt-0.5 leading-tight">+ 2 Free Soaps</span>
                </div>
                <div class="mt-1.5 pt-1 border-t border-amber-500/20">
                  <span class="text-sm sm:text-lg font-black text-white font-sans">₹1,700</span>
                </div>
              </div>

              {/* Card 3: 3-Month Mega Pack (BEST VALUE) */}
              <div class="relative bg-gradient-to-b from-[#4A0E1A] to-[#2B050B] border-2 border-amber-400 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center shadow-[0_4px_15px_rgba(245,158,11,0.25)] transition-all hover:scale-[1.02]">
                <div class="absolute -top-2 right-1 sm:right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[6.5px] sm:text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-sm leading-none">
                  BEST VALUE
                </div>
                <div>
                  <span class="text-[8.5px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wide block">3-Month Mega</span>
                  <span class="text-[7px] sm:text-[9px] text-amber-300 font-semibold block mt-0.5 leading-tight">+ Free Chikki</span>
                </div>
                <div class="mt-1.5 pt-1 border-t border-amber-400/30">
                  <span class="text-sm sm:text-lg font-black text-white font-sans">₹2,400</span>
                </div>
              </div>

            </div>

            {/* Primary CTA Button */}
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mb-2.5">
              <a 
                href={\`/product/\${comboHandle}\`} 
                class="bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] hover:from-[#FFFBEB] hover:to-[#F59E0B] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-[0_6px_22px_rgba(245,158,11,0.4)] transition-all active:scale-95 text-center font-sans flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <span>CLAIM DIWALI OFFER NOW</span>
                <span class="text-base font-bold">→</span>
              </a>
            </div>

            {/* Trust Reassurance Strip */}
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-[10px] sm:text-[11px] font-semibold text-amber-200/90 font-sans">
              <span class="flex items-center gap-1">✓ Free Shipping</span>
              <span class="text-amber-400/30">•</span>
              <span class="flex items-center gap-1">✓ 100% Natural</span>
              <span class="text-amber-400/30">•</span>
              <span class="flex items-center gap-1">✓ Secure Payment</span>
              <span class="text-amber-400/30">•</span>
              <span class="flex items-center gap-1"><span class="text-amber-400">⚡</span> Extra 10% UPI Off</span>
            </div>

          </div>

        </div>
      </div>`;

if (slide0Regex.test(content)) {
  content = content.replace(slide0Regex, newSlide0Block);
  console.log('✅ Slide 0 replaced with Native 2-Column Luxury Slide!');
} else {
  console.error('❌ Could not match slide0Regex! Check file structure.');
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 Successfully applied native 2-column festive slide!');

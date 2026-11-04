// scripts/apply-royal-diwali-animations.mjs
import fs from 'fs';

const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');

// 1. ADD FESTIVE CSS STYLES INTO <style> AT BOTTOM
const styleAnchor = '<style>';
const festiveStyles = `<style>
  /* 🪔 THE 2026 ROYAL DIWALI FESTIVE ANIMATION SUITE */
  @keyframes diyaPulse {
    0% {
      transform: scale(0.92);
      opacity: 0.65;
      filter: blur(65px);
    }
    50% {
      transform: scale(1.08);
      opacity: 0.95;
      filter: blur(85px);
    }
    100% {
      transform: scale(0.94);
      opacity: 0.70;
      filter: blur(70px);
    }
  }
  .animate-diya-glow {
    animation: diyaPulse 4.5s ease-in-out infinite alternate;
  }

  @keyframes flameFlicker {
    0%, 100% { opacity: 0.75; transform: scale(1) translateY(0); }
    25% { opacity: 0.95; transform: scale(1.06) translateY(-2px); }
    50% { opacity: 0.70; transform: scale(0.96) translateY(1px); }
    75% { opacity: 1; transform: scale(1.08) translateY(-1px); }
  }
  .animate-flame-flicker {
    animation: flameFlicker 2.8s ease-in-out infinite alternate;
  }

  /* ✨ FLOATING GOLDEN STARDUST / EMBERS */
  .stardust-particle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, #FFFBEB 20%, #FDE68A 60%, #F59E0B 100%);
    box-shadow: 0 0 6px 1px rgba(245, 158, 11, 0.65);
    pointer-events: none;
    animation: floatStardust linear infinite;
    will-change: transform, opacity;
  }
  @keyframes floatStardust {
    0% {
      transform: translate3d(0, 100px, 0) scale(0.2);
      opacity: 0;
    }
    20% {
      opacity: 0.85;
    }
    75% {
      opacity: 0.6;
    }
    100% {
      transform: translate3d(var(--x-drift, 20px), -140px, 0) scale(1);
      opacity: 0;
    }
  }

  /* Staggered distribution across hero */
  .p1  { left: 6%;  bottom: 12%; width: 3px;   height: 3px;   --x-drift: 15px;  animation-duration: 7s;   animation-delay: 0s; }
  .p2  { left: 15%; bottom: 6%;  width: 4px;   height: 4px;   --x-drift: -18px; animation-duration: 8.5s; animation-delay: 1.5s; }
  .p3  { left: 24%; bottom: 16%; width: 2.5px; height: 2.5px; --x-drift: 22px;  animation-duration: 6.2s; animation-delay: 3s; }
  .p4  { left: 33%; bottom: 8%;  width: 4.5px; height: 4.5px; --x-drift: -14px; animation-duration: 9s;   animation-delay: 0.8s; }
  .p5  { left: 44%; bottom: 14%; width: 3px;   height: 3px;   --x-drift: 12px;  animation-duration: 7.6s; animation-delay: 2.2s; }
  .p6  { left: 54%; bottom: 5%;  width: 3.5px; height: 3.5px; --x-drift: -22px; animation-duration: 8.2s; animation-delay: 4.1s; }
  .p7  { left: 64%; bottom: 18%; width: 4px;   height: 4px;   --x-drift: 18px;  animation-duration: 6.8s; animation-delay: 1.2s; }
  .p8  { left: 74%; bottom: 4%;  width: 2.5px; height: 2.5px; --x-drift: -16px; animation-duration: 9.4s; animation-delay: 3.4s; }
  .p9  { left: 84%; bottom: 11%; width: 3.5px; height: 3.5px; --x-drift: 14px;  animation-duration: 7.1s; animation-delay: 0.5s; }
  .p10 { left: 93%; bottom: 9%;  width: 3px;   height: 3px;   --x-drift: -12px; animation-duration: 8.4s; animation-delay: 2.7s; }
  .p11 { left: 10%; bottom: 22%; width: 3px;   height: 3px;   --x-drift: -10px; animation-duration: 7.9s; animation-delay: 4.8s; }
  .p12 { left: 48%; bottom: 20%; width: 4px;   height: 4px;   --x-drift: 15px;  animation-duration: 6.6s; animation-delay: 3.8s; }
  .p13 { left: 70%; bottom: 15%; width: 3px;   height: 3px;   --x-drift: -15px; animation-duration: 8.7s; animation-delay: 1.9s; }
  .p14 { left: 88%; bottom: 24%; width: 3.5px; height: 3.5px; --x-drift: 20px;  animation-duration: 7.3s; animation-delay: 5.2s; }

  /* ⚡ LIQUID GOLD SHEEN SWEEP ON CTA */
  .btn-gold-sweep {
    position: relative;
    overflow: hidden;
  }
  .btn-gold-sweep::after {
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
      rgba(253, 230, 138, 0.65) 50%,
      transparent 55%
    );
    transform: translateX(-100%) skewX(-20deg);
    animation: goldSheenSweep 4.2s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes goldSheenSweep {
    0%, 25% { transform: translateX(-100%) skewX(-20deg); }
    40% { transform: translateX(100%) skewX(-20deg); }
    100% { transform: translateX(100%) skewX(-20deg); }
  }

  /* 💎 BEST VALUE 3-MONTH CARD BREATHING GLOW */
  @keyframes cardGlowPulse {
    0% {
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);
      border-color: rgba(245, 158, 11, 0.6);
    }
    50% {
      box-shadow: 0 8px 30px rgba(245, 158, 11, 0.55), 0 0 12px rgba(253, 230, 138, 0.35);
      border-color: rgba(253, 230, 138, 0.95);
    }
    100% {
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);
      border-color: rgba(245, 158, 11, 0.6);
    }
  }
  .card-best-value-glow {
    animation: cardGlowPulse 3.5s ease-in-out infinite;
  }
`;

if (!content.includes('diyaPulse')) {
  content = content.replace(styleAnchor, festiveStyles);
  console.log('✅ Added festive animations to <style>');
} else {
  console.log('Festive styles already exist');
}

// 2. ENHANCE SLIDE 0 HTML WITH LIVE DIYA FLAME GLOW + STARDUST PARTICLES + LIQUID GOLD CTA
const slide0Start = content.indexOf('id="hero-slide-0"');
const slide1Start = content.indexOf('id="hero-slide-1"');

if (slide0Start === -1 || slide1Start === -1) {
  console.error('Could not find slide markers!');
  process.exit(1);
}

// Let's create the enhanced Slide 0
const enhancedSlide0 = `id="hero-slide-0" 
        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4 relative overflow-hidden"
        data-slide-index="0"
      >
        {/* 🪔 1. FESTIVE MAROON & AMBER AMBIENT RADIAL BACKDROP */}
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(180,20,40,0.32)_0%,rgba(245,158,11,0.18)_40%,transparent_75%)] pointer-events-none rounded-3xl"></div>

        {/* ✨ 2. FLOATING GOLDEN STARDUST PARTICLES (GPU-Accelerated Pure CSS) */}
        <div class="absolute inset-0 overflow-hidden pointer-events-none z-10">
          <div class="stardust-particle p1"></div>
          <div class="stardust-particle p2"></div>
          <div class="stardust-particle p3"></div>
          <div class="stardust-particle p4"></div>
          <div class="stardust-particle p5"></div>
          <div class="stardust-particle p6"></div>
          <div class="stardust-particle p7"></div>
          <div class="stardust-particle p8"></div>
          <div class="stardust-particle p9"></div>
          <div class="stardust-particle p10"></div>
          <div class="stardust-particle p11"></div>
          <div class="stardust-particle p12"></div>
          <div class="stardust-particle p13"></div>
          <div class="stardust-particle p14"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-10 items-center relative z-20">
          
          {/* Visual: On Mobile = Order 1 (TOP), On Desktop = Order 2 (RIGHT) */}
          <div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative w-full py-1">
            
            {/* 🔥 Primary Breathing Diya Flame Ambient Aura */}
            <div class="absolute w-[240px] sm:w-[320px] lg:w-[400px] h-[240px] sm:h-[320px] lg:h-[400px] bg-gradient-to-tr from-amber-600/40 via-amber-400/30 to-orange-500/25 rounded-full blur-[75px] pointer-events-none animate-diya-glow"></div>

            {/* 🔥 Secondary warm flame flicker directly under the samai and clay diyas */}
            <div class="absolute bottom-4 left-6 sm:left-10 w-[140px] sm:w-[180px] h-[90px] sm:h-[120px] bg-orange-500/35 rounded-full blur-[45px] pointer-events-none animate-flame-flicker"></div>

            {/* Floating Festive Trust Pill */}
            <div class="relative z-20 mb-2 bg-gradient-to-r from-[#3A0A13]/90 via-[#4A0E1A]/90 to-[#2A050C]/90 backdrop-blur-md border border-amber-400/40 px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
              <span class="text-amber-400 text-xs animate-bounce">🪔</span>
              <span class="text-[9px] sm:text-[10.5px] font-bold tracking-wider text-amber-200 uppercase font-sans">Royal Shubh Diwali Luxury Gift Hamper</span>
            </div>

            {/* Hamper Image (Diwali Hamper Showcase) */}
            <div class="relative z-10 flex flex-col items-center justify-center group">
              <a href={\`/product/\${comboHandle}\`} title="Claim Diwali Gift Hamper" class="block cursor-pointer">
                <img 
                  src="/banners/diwali-hamper-showcase.webp" 
                  alt="Sujata Nutrilive Shubh Diwali Festive Gift Hamper with Spirulina, Sea Buckthorn, Chikki and Handmade Soaps" 
                  class="h-[210px] sm:h-[270px] md:h-[320px] lg:h-[360px] w-auto object-contain rounded-2xl sm:rounded-3xl border border-amber-500/40 shadow-[0_15px_40px_rgba(245,158,11,0.25)] group-hover:scale-105 group-hover:border-amber-400 transition-all duration-500 ease-out"
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

            {/* Festive Headline with Gold Gradient & Soft Drop Glow */}
            <h1 class="text-2xl sm:text-3xl lg:text-[2.6rem] xl:text-[2.9rem] font-serif font-normal leading-[1.15] tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400 drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]">
              SHUBH DIWALI<br/>
              <span class="italic font-serif text-amber-300">FESTIVE OFFERS</span>
            </h1>

            {/* Extra 10% Prepaid Pill */}
            <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-[9.5px] sm:text-xs font-bold tracking-wider uppercase mb-2.5 sm:mb-3 shadow-inner">
              <span class="animate-spin text-xs">✨</span>
              <span>EXTRA 10% OFF ON PREPAID ORDERS</span>
            </div>

            {/* 3 Festive Offer Cards (Exact 1:1 Match to Untitled design 14) */}
            <div class="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full max-w-md sm:max-w-lg mb-3">
              
              {/* Card 1: 1-Month Pack */}
              <div class="relative bg-gradient-to-b from-[#3A0A13]/90 to-[#220408]/90 border border-amber-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center transition-all hover:border-amber-400 hover:scale-[1.02] shadow-md group cursor-pointer">
                <div>
                  <span class="text-[8.5px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wide block">1-Month Pack</span>
                  <span class="text-[7px] sm:text-[9px] text-amber-100/70 block mt-0.5 leading-tight">Spirulina & Sea Buckthorn</span>
                </div>
                <div class="mt-1.5 pt-1 border-t border-amber-500/20">
                  <span class="text-sm sm:text-lg font-black text-white font-sans">₹1,050</span>
                </div>
              </div>

              {/* Card 2: 2-Month Pack */}
              <div class="relative bg-gradient-to-b from-[#3A0A13]/90 to-[#220408]/90 border border-amber-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center transition-all hover:border-amber-400 hover:scale-[1.02] shadow-md group cursor-pointer">
                <div>
                  <span class="text-[8.5px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wide block">2-Month Pack</span>
                  <span class="text-[7px] sm:text-[9px] text-amber-300 font-semibold block mt-0.5 leading-tight">+ 2 Free Soaps</span>
                </div>
                <div class="mt-1.5 pt-1 border-t border-amber-500/20">
                  <span class="text-sm sm:text-lg font-black text-white font-sans">₹1,700</span>
                </div>
              </div>

              {/* Card 3: 3-Month Mega Pack (BEST VALUE with Breathing Glow) */}
              <div class="relative bg-gradient-to-b from-[#4A0E1A] to-[#2B050B] border-2 border-amber-400 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center card-best-value-glow transition-all hover:scale-[1.02] cursor-pointer">
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

            {/* Primary CTA Button with Liquid Gold Sweep Sheen */}
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mb-2.5">
              <a 
                href={\`/product/\${comboHandle}\`} 
                class="btn-gold-sweep bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] hover:from-[#FFFBEB] hover:to-[#F59E0B] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-[0_8px_25px_rgba(245,158,11,0.45)] transition-all active:scale-95 text-center font-sans flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
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
      </div>

      `;

// Find where Slide 0 ends (before Slide 1 comment)
const slide1CommentIdx = content.indexOf('{/* -------------------------------------------------------------\r\n          SLIDE 1: PURE SPIRULINA PROTOCOL');
const altSlide1CommentIdx = content.indexOf('{/* -------------------------------------------------------------\n          SLIDE 1: PURE SPIRULINA PROTOCOL');
const actualSlide1Comment = slide1CommentIdx !== -1 ? slide1CommentIdx : altSlide1CommentIdx;

content = content.substring(0, slide0Start) + enhancedSlide0 + content.substring(actualSlide1Comment);

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 Successfully applied Royal Diwali Animations to Slide 0 in StoreHero.astro!');

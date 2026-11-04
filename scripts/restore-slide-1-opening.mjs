import fs from 'fs';
const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');

const targetAnchor = `      </div>\r\n\r\n          {/* Copy & Offer: On Mobile = Order 2 (BOTTOM), On Desktop = Order 1 (LEFT) */}`;
const altTargetAnchor = `      </div>\n\n          {/* Copy & Offer: On Mobile = Order 2 (BOTTOM), On Desktop = Order 1 (LEFT) */}`;

const spirulinaSlideOpening = `      </div>

      {/* -------------------------------------------------------------
          SLIDE 1: PURE SPIRULINA PROTOCOL (Energy & Bio-Iron - #1 High-Intent Entry)
          ------------------------------------------------------------- */}
      <div 
        id="hero-slide-1" 
        class="hero-slide-card min-w-full w-full flex-shrink-0 snap-center px-1 sm:px-4"
        data-slide-index="1"
      >
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-10 items-center">
          
          {/* Visual: On Mobile = Order 1 (TOP), On Desktop = Order 2 (RIGHT) */}
          <div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center relative w-full py-1">
            <div class="absolute w-[200px] sm:w-[280px] lg:w-[340px] h-[200px] sm:h-[280px] lg:h-[340px] bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>

            {/* Floating Trust Pill */}
            <div class="relative z-20 mb-1 bg-black/75 backdrop-blur-md border border-emerald-400/30 px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <span class="text-emerald-400 text-xs">🌿</span>
              <span class="text-[9px] sm:text-[10px] font-bold tracking-wide text-emerald-200 font-sans">Pure Spirulina • Bio-Secure Closed Hydro-Dome Cultivation</span>
            </div>

            {/* Product Image */}
            <div class="relative z-10 flex flex-col items-center justify-center group">
              <img 
                src="/products/sujata-spirulina-capsules-bottle-transparent.png" 
                alt="Sujata Pure Cold-Pressed Spirulina Capsules Bottle" 
                class="h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div class="w-1/2 h-2.5 bg-black/70 rounded-[100%] blur-md -mt-1.5 pointer-events-none"></div>
            </div>
          </div>

          {/* Copy & Offer: On Mobile = Order 2 (BOTTOM), On Desktop = Order 1 (LEFT) */}`;

if (content.includes(targetAnchor)) {
  content = content.replace(targetAnchor, spirulinaSlideOpening);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Restored Slide 1 opening with CRLF');
} else if (content.includes(altTargetAnchor)) {
  content = content.replace(altTargetAnchor, spirulinaSlideOpening);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Restored Slide 1 opening with LF');
} else {
  console.error('❌ Could not find target anchor!');
}

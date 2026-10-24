import fs from 'fs';

const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');

const target = `{/* 3 Festive Offer Cards (Exact 1:1 Match to Untitled design 14) */}
            <div class="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full max-w-md sm:max-w-lg mb-3">
              
              {/* Card 1: 1-Month Pack */}
              <div class="festive-reveal-elem festive-card-1 relative bg-gradient-to-b from-[#3A0A13]/90 to-[#220408]/90 border border-amber-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center transition-all hover:border-amber-400 hover:scale-[1.02] shadow-md group cursor-pointer">
                <div>
                  <span class="text-[8.5px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wide block">1-Month Pack</span>
                  <span class="text-[7px] sm:text-[9px] text-amber-100/70 block mt-0.5 leading-tight">Spirulina & Sea Buckthorn</span>
                </div>
                <div class="mt-1.5 pt-1 border-t border-amber-500/20">
                  <span class="text-sm sm:text-lg font-black text-white font-sans">₹1,050</span>
                </div>
              </div>

              {/* Card 2: 2-Month Pack */}
              <div class="festive-reveal-elem festive-card-2 relative bg-gradient-to-b from-[#3A0A13]/90 to-[#220408]/90 border border-amber-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center transition-all hover:border-amber-400 hover:scale-[1.02] shadow-md group cursor-pointer">
                <div>
                  <span class="text-[8.5px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wide block">2-Month Pack</span>
                  <span class="text-[7px] sm:text-[9px] text-amber-300 font-semibold block mt-0.5 leading-tight">+ 2 Free Soaps</span>
                </div>
                <div class="mt-1.5 pt-1 border-t border-amber-500/20">
                  <span class="text-sm sm:text-lg font-black text-white font-sans">₹1,700</span>
                </div>
              </div>

              {/* Card 3: 3-Month Mega Pack (BEST VALUE with Breathing Glow) */}
              <div class="festive-reveal-elem festive-card-3 relative bg-gradient-to-b from-[#4A0E1A] to-[#2B050B] border-2 border-amber-400 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center card-best-value-glow transition-all hover:scale-[1.02] cursor-pointer">
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

            </div>`;

const replacement = `{/* 3 Festive Offer Cards (Interactive 1-Click Direct Links to Plans) */}
            <div class="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full max-w-md sm:max-w-lg mb-3">
              
              {/* Card 1: 1-Month Pack */}
              <a 
                href={\`/product/\${comboHandle}?plan=1m&variant=52759081779332\`}
                class="festive-reveal-elem festive-card-1 relative bg-gradient-to-b from-[#3A0A13]/90 to-[#220408]/90 border border-amber-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center transition-all hover:border-amber-400 hover:scale-[1.02] shadow-md group cursor-pointer block no-underline"
              >
                <div>
                  <span class="text-[8.5px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wide block">1-Month Pack</span>
                  <span class="text-[7px] sm:text-[9px] text-amber-100/70 block mt-0.5 leading-tight">Spirulina & Sea Buckthorn</span>
                </div>
                <div class="mt-1.5 pt-1 border-t border-amber-500/20">
                  <span class="text-sm sm:text-lg font-black text-white font-sans">₹1,050</span>
                </div>
              </a>

              {/* Card 2: 2-Month Pack */}
              <a 
                href={\`/product/\${comboHandle}?plan=2m&variant=52759081812100\`}
                class="festive-reveal-elem festive-card-2 relative bg-gradient-to-b from-[#3A0A13]/90 to-[#220408]/90 border border-amber-500/30 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center transition-all hover:border-amber-400 hover:scale-[1.02] shadow-md group cursor-pointer block no-underline"
              >
                <div>
                  <span class="text-[8.5px] sm:text-[11px] font-bold text-amber-200 uppercase tracking-wide block">2-Month Pack</span>
                  <span class="text-[7px] sm:text-[9px] text-amber-300 font-semibold block mt-0.5 leading-tight">+ 2 Free Soaps</span>
                </div>
                <div class="mt-1.5 pt-1 border-t border-amber-500/20">
                  <span class="text-sm sm:text-lg font-black text-white font-sans">₹1,700</span>
                </div>
              </a>

              {/* Card 3: 3-Month Mega Pack (BEST VALUE with Breathing Glow) */}
              <a 
                href={\`/product/\${comboHandle}?plan=3m&variant=52759081844868\`}
                class="festive-reveal-elem festive-card-3 relative bg-gradient-to-b from-[#4A0E1A] to-[#2B050B] border-2 border-amber-400 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between text-center card-best-value-glow transition-all hover:scale-[1.02] cursor-pointer block no-underline"
              >
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
              </a>

            </div>`;

// Normalize line endings for replacement
const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const newContent = normContent.replace(normTarget, replacement);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('✅ Successfully patched StoreHero.astro with clickable offer cards!');
} else {
  console.error('❌ Target string not found in StoreHero.astro');
}

import fs from 'fs';

const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');

const targetAnchor = `<div class="max-w-[94rem] mx-auto px-3 sm:px-6 lg:px-12 relative z-10">`;

const bannerSnippet = `
    {/* =========================================================================
        🪔 0. SHUBH DIWALI FESTIVE MEGA BANNER (Zero-Crop Responsive Art Direction)
        ========================================================================= */}
    <div class="w-full max-w-5xl mx-auto mb-6 sm:mb-8 px-1 sm:px-0">
      <div class="flex items-center justify-center gap-2 mb-2 sm:mb-3">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-bold tracking-wide uppercase shadow-sm">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          🪔 Shubh Diwali Festive Mega Sale • Limited Period Gift Hamper
        </span>
      </div>

      <a 
        href={\`/product/\${comboHandle}\`} 
        title="Claim Shubh Diwali Festive Offers - Sujata Nutrilive"
        class="block relative group overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/40 shadow-[0_12px_40px_rgba(245,158,11,0.25)] hover:shadow-[0_18px_50px_rgba(245,158,11,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-400 bg-[#240409]"
      >
        <picture>
          {/* 1. Mobile Screen (< 640px): Dedicated Vertical Master (96 KB WebP, Zero-Crop, High-Legibility) */}
          <source 
            media="(max-width: 639px)" 
            srcset="/banners/diwali-hero-mobile-750.webp 1x, /banners/diwali-hero-mobile-master.webp 2x" 
            type="image/webp" 
          />
          <source 
            media="(max-width: 639px)" 
            srcset="/banners/diwali-hero-mobile-master.jpg" 
          />

          {/* 2. Tablet Screen (640px - 1023px): Cinematic Safe-Margin 2:1 */}
          <source 
            media="(max-width: 1023px)" 
            srcset="/banners/diwali-hero-cinematic.jpg" 
          />

          {/* 3. Desktop Screen (>= 1024px): 16:9 Widescreen Master WebP */}
          <source 
            media="(min-width: 1024px)" 
            srcset="/banners/diwali-hero-desktop-master.webp" 
            type="image/webp" 
          />
          <source 
            media="(min-width: 1024px)" 
            srcset="/banners/diwali-hero-desktop-master.jpg" 
          />

          {/* High-Performance Fallback Image with Explicit Dimensions to prevent CLS */}
          <img 
            src="/banners/diwali-hero-desktop-master.jpg" 
            alt="Sujata Nutrilive Shubh Diwali Festive Offers - 1-Month, 2-Month & 3-Month Spirulina & Sea Buckthorn Combo Hampers" 
            class="w-full h-auto object-contain block transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            width="2752"
            height="1536"
          />
        </picture>

        {/* Ambient Golden Hover Sheen */}
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
      </a>
    </div>

    {/* Section divider to browse daily routine protocols */}
    <div class="flex items-center justify-center gap-3 max-w-md mx-auto mb-3 sm:mb-4 text-center">
      <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"></div>
      <span class="text-[9.5px] sm:text-xs font-bold text-emerald-300/80 uppercase tracking-widest">Or Explore Daily Protocols Below</span>
      <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"></div>
    </div>
`;

if (!content.includes(targetAnchor)) {
  console.error('Target anchor not found!');
  process.exit(1);
}

if (content.includes('SHUBH DIWALI FESTIVE MEGA BANNER')) {
  console.log('Banner already inserted!');
  process.exit(0);
}

content = content.replace(targetAnchor, targetAnchor + '\n' + bannerSnippet);
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully inserted Diwali Festive Mega Banner into StoreHero.astro!');

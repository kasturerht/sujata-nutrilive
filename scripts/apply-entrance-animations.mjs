import fs from 'fs';

const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Script: glowColors, slide0Timeout, tab styling, dot styling, and slide0 reveal trigger
const oldScriptTarget = `    const slides = track.querySelectorAll('.hero-slide-card');
    let currentIndex = 0;
    let autoPlayTimer = null;
    const SLIDE_DURATION = 6000; // 6s per protocol

    const glowColors = [
      'rgba(16, 185, 129, 0.16)', // Spirulina (Luminous Emerald) - index 0
      'rgba(245, 158, 11, 0.14)', // Combo (Warm Amber Gold) - index 1
      'rgba(217, 119, 6, 0.15)',  // Sea Buckthorn (Himalayan Amber) - index 2
    ];

    function updateUI(targetIndex) {
      if (targetIndex < 0 || targetIndex >= slides.length) return;
      currentIndex = targetIndex;

      // 1. Update Tabs
      tabButtons.forEach((btn, idx) => {
        const isCurrent = idx === currentIndex;
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        const progressLine = btn.querySelector('.tab-progress-line');

        if (isCurrent) {
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
        }
      });

      // 2. Update Dots
      dotIndicators.forEach((dot, idx) => {
        const isCurrent = idx === currentIndex;
        if (isCurrent) {
          dot.className = currentIndex === 0
            ? 'hero-dot-indicator w-6 h-1.5 rounded-full bg-emerald-400 transition-all duration-300 cursor-pointer'
            : 'hero-dot-indicator w-6 h-1.5 rounded-full bg-amber-400 transition-all duration-300 cursor-pointer';
        } else {
          dot.className = 'hero-dot-indicator w-2 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-all duration-300 cursor-pointer';
        }
      });

      // 3. Update Ambient Glow
      if (ambientGlow && glowColors[currentIndex]) {
        ambientGlow.style.backgroundColor = glowColors[currentIndex];
      }
    }`;

const newScriptReplacement = `    const slides = track.querySelectorAll('.hero-slide-card');
    let currentIndex = 0;
    let autoPlayTimer = null;
    let slide0Timeout = null;
    const SLIDE_DURATION = 6000; // 6s per protocol

    const glowColors = [
      'rgba(245, 158, 11, 0.20)', // Diwali Festive (Warm Amber Glow) - index 0
      'rgba(16, 185, 129, 0.16)', // Spirulina (Luminous Emerald) - index 1
      'rgba(245, 158, 11, 0.14)', // Combo (Warm Amber Gold) - index 2
      'rgba(217, 119, 6, 0.15)',  // Sea Buckthorn (Himalayan Amber) - index 3
    ];

    function updateUI(targetIndex) {
      if (targetIndex < 0 || targetIndex >= slides.length) return;
      currentIndex = targetIndex;

      // 1. Update Tabs
      tabButtons.forEach((btn, idx) => {
        const isCurrent = idx === currentIndex;
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        const progressLine = btn.querySelector('.tab-progress-line');

        if (isCurrent) {
          if (idx === 0) {
            btn.classList.add('active', 'bg-gradient-to-r', 'from-amber-600', 'to-amber-700', 'text-white', 'shadow-md', 'border-amber-400/50');
            btn.classList.remove('text-emerald-100/70', 'border-transparent', 'bg-[#064E3B]', 'border-emerald-400/40');
          } else {
            btn.classList.add('active', 'bg-[#064E3B]', 'text-white', 'shadow-md', 'border-emerald-400/40');
            btn.classList.remove('text-emerald-100/70', 'border-transparent', 'bg-gradient-to-r', 'from-amber-600', 'to-amber-700', 'border-amber-400/50');
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
          btn.classList.remove('active', 'bg-[#064E3B]', 'text-white', 'shadow-md', 'border-emerald-400/40', 'bg-gradient-to-r', 'from-amber-600', 'to-amber-700', 'border-amber-400/50');
          btn.classList.add('text-emerald-100/70', 'border-transparent');
          if (progressLine) {
            progressLine.style.transition = 'none';
            progressLine.style.transform = 'scaleX(0)';
          }
        }
      });

      // 2. Update Dots
      dotIndicators.forEach((dot, idx) => {
        const isCurrent = idx === currentIndex;
        if (isCurrent) {
          dot.className = (currentIndex === 0 || currentIndex === 2 || currentIndex === 3)
            ? 'hero-dot-indicator w-6 h-1.5 rounded-full bg-amber-400 transition-all duration-300 cursor-pointer'
            : 'hero-dot-indicator w-6 h-1.5 rounded-full bg-emerald-400 transition-all duration-300 cursor-pointer';
        } else {
          dot.className = 'hero-dot-indicator w-2 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-all duration-300 cursor-pointer';
        }
      });

      // 3. Update Ambient Glow
      if (ambientGlow && glowColors[currentIndex]) {
        ambientGlow.style.backgroundColor = glowColors[currentIndex];
      }

      // 4. Staggered Entrance Reveal for Diwali Slide (Slide 0)
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
      }
    }`;

// Standardize CRLF to LF for matching
const isCRLF = content.includes('\r\n');
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedOldTarget = oldScriptTarget.replace(/\r\n/g, '\n');

if (!normalizedContent.includes(normalizedOldTarget)) {
  console.error('ERROR: Could not find oldScriptTarget in StoreHero.astro');
  process.exit(1);
}

let updated = normalizedContent.replace(normalizedOldTarget, newScriptReplacement);

// 2. Add Entrance Reveal Animations to <style>
const styleAddition = `
  /* 🪔 2026 CHOREOGRAPHED ENTRANCE REVEAL SUITE (Slide 0) */
  @keyframes hamperReveal {
    0% {
      opacity: 0;
      transform: translate3d(0, 24px, 0) scale(0.93);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes festiveFadeUp {
    0% {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes cardCascade {
    0% {
      opacity: 0;
      transform: translate3d(0, 22px, 0) scale(0.94);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes ctaGlideIn {
    0% {
      opacity: 0;
      transform: translate3d(0, 18px, 0) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  /* GPU-Accelerated Staggered Entrance (Pure CSS) */
  #hero-slide-0.active-reveal .festive-reveal-elem {
    opacity: 0;
    animation-fill-mode: forwards;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
  }

  #hero-slide-0.active-reveal .festive-hamper-reveal {
    animation-name: hamperReveal;
    animation-duration: 0.65s;
    animation-delay: 0.06s;
  }

  #hero-slide-0.active-reveal .festive-badge-reveal {
    animation-name: festiveFadeUp;
    animation-duration: 0.50s;
    animation-delay: 0.18s;
  }

  #hero-slide-0.active-reveal .festive-heading-reveal {
    animation-name: festiveFadeUp;
    animation-duration: 0.55s;
    animation-delay: 0.28s;
  }

  #hero-slide-0.active-reveal .festive-prepaid-reveal {
    animation-name: festiveFadeUp;
    animation-duration: 0.45s;
    animation-delay: 0.38s;
  }

  #hero-slide-0.active-reveal .festive-card-1 {
    animation-name: cardCascade;
    animation-duration: 0.48s;
    animation-delay: 0.48s;
  }

  #hero-slide-0.active-reveal .festive-card-2 {
    animation-name: cardCascade;
    animation-duration: 0.48s;
    animation-delay: 0.58s;
  }

  #hero-slide-0.active-reveal .festive-card-3 {
    animation-name: cardCascade;
    animation-duration: 0.52s;
    animation-delay: 0.68s;
  }

  #hero-slide-0.active-reveal .festive-cta-reveal {
    animation-name: ctaGlideIn;
    animation-duration: 0.52s;
    animation-delay: 0.78s;
  }

  #hero-slide-0.active-reveal .festive-trust-reveal {
    animation-name: festiveFadeUp;
    animation-duration: 0.45s;
    animation-delay: 0.88s;
  }

  /* Once reveal completes, unlock all native CSS hover transformations */
  #hero-slide-0.reveal-done .festive-reveal-elem {
    opacity: 1;
    transform: none;
    animation: none;
  }

  @media (prefers-reduced-motion: reduce) {
    #hero-slide-0.active-reveal .festive-reveal-elem {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`;

const oldStyleEnd = `  .card-best-value-glow {
    animation: cardGlowPulse 3.5s ease-in-out infinite;
  }`;

if (!updated.includes(oldStyleEnd)) {
  console.error('ERROR: Could not find oldStyleEnd in StoreHero.astro');
  process.exit(1);
}

updated = updated.replace(oldStyleEnd, oldStyleEnd + '\n' + styleAddition);

// Restore original line endings (CRLF)
if (isCRLF) {
  updated = updated.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, updated, 'utf8');
console.log('SUCCESS: StoreHero.astro updated with script logic and entrance reveal animations!');

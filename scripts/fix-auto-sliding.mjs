import fs from 'fs';

const filePath = 'src/components/StoreHero.astro';
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// Find the initProtocolHeroSwitcher function and replace with the bulletproof implementation
const oldScriptStart = `  function initProtocolHeroSwitcher() {
    const track = document.getElementById('hero-slider-track');
    const tabButtons = document.querySelectorAll('.hero-tab-btn');
    const dotIndicators = document.querySelectorAll('.hero-dot-indicator');
    const ambientGlow = document.getElementById('hero-ambient-glow');
    if (!track) return;

    const slides = track.querySelectorAll('.hero-slide-card');
    let currentIndex = 0;
    let autoPlayTimer = null;
    let slide0Timeout = null;
    const SLIDE_DURATION = 6000; // 6s per protocol`;

const newScriptImplementation = `  function initProtocolHeroSwitcher() {
    const track = document.getElementById('hero-slider-track');
    const tabButtons = document.querySelectorAll('.hero-tab-btn');
    const dotIndicators = document.querySelectorAll('.hero-dot-indicator');
    const ambientGlow = document.getElementById('hero-ambient-glow');
    if (!track) return;

    // Prevent duplicate initializations on re-renders
    if (window.__sujataHeroAutoPlayTimer) {
      clearInterval(window.__sujataHeroAutoPlayTimer);
      window.__sujataHeroAutoPlayTimer = null;
    }

    const slides = track.querySelectorAll('.hero-slide-card');
    if (!slides.length) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    let revealDoneTimeout = null;
    let isAutoScrolling = false;
    let autoScrollReleaseTimeout = null;
    const SLIDE_DURATION = 5000; // 5s per banner - optimal luxury D2C pacing

    const glowColors = [
      'rgba(245, 158, 11, 0.20)', // Diwali Festive (Warm Amber Glow) - index 0
      'rgba(16, 185, 129, 0.16)', // Spirulina (Luminous Emerald) - index 1
      'rgba(245, 158, 11, 0.14)', // Combo (Warm Amber Gold) - index 2
      'rgba(217, 119, 6, 0.15)',  // Sea Buckthorn (Himalayan Amber) - index 3
    ];

    function updateUI(targetIndex) {
      if (targetIndex < 0 || targetIndex >= slides.length) return;
      currentIndex = targetIndex;

      // 1. Update Tabs & Progress lines
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
            // Trigger animation frame so transition resets cleanly
            requestAnimationFrame(() => {
              setTimeout(() => {
                progressLine.style.transition = \`transform \${SLIDE_DURATION}ms linear\`;
                progressLine.style.transform = 'scaleX(1)';
              }, 40);
            });
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

      // 3. Update Ambient Dynamic Glow
      if (ambientGlow && glowColors[currentIndex]) {
        ambientGlow.style.backgroundColor = glowColors[currentIndex];
      }

      // 4. Staggered Entrance Reveal for Active Slide
      slides.forEach((slide, idx) => {
        if (idx === targetIndex) {
          slide.classList.remove('active-reveal', 'reveal-done');
          void slide.offsetWidth; // Force CSS reflow to cleanly trigger entrance reveal
          slide.classList.add('active-reveal');
        } else {
          slide.classList.remove('active-reveal', 'reveal-done');
        }
      });

      if (revealDoneTimeout) clearTimeout(revealDoneTimeout);
      revealDoneTimeout = setTimeout(() => {
        const activeSlide = slides[currentIndex];
        if (activeSlide) {
          activeSlide.classList.remove('active-reveal');
          activeSlide.classList.add('reveal-done');
        }
      }, 1350);
    }

    function scrollToIndex(targetIndex) {
      if (!slides[targetIndex]) return;
      const targetSlide = slides[targetIndex];
      isAutoScrolling = true;
      if (autoScrollReleaseTimeout) clearTimeout(autoScrollReleaseTimeout);

      track.scrollTo({
        left: targetSlide.offsetLeft,
        behavior: 'smooth'
      });
      updateUI(targetIndex);

      // Release auto-scroll lock after smooth scroll animation completes
      autoScrollReleaseTimeout = setTimeout(() => {
        isAutoScrolling = false;
      }, 650);
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        const nextIndex = (currentIndex + 1) % slides.length;
        scrollToIndex(nextIndex);
      }, SLIDE_DURATION);
      window.__sujataHeroAutoPlayTimer = autoPlayTimer;
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
      if (window.__sujataHeroAutoPlayTimer) {
        clearInterval(window.__sujataHeroAutoPlayTimer);
        window.__sujataHeroAutoPlayTimer = null;
      }
    }

    // Tab Button Clicks
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(btn.getAttribute('data-tab-index') || '0', 10);
        stopAutoPlay();
        scrollToIndex(idx);
        startAutoPlay();
      });
    });

    // Dot Indicators Clicks
    dotIndicators.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(dot.getAttribute('data-dot-index') || '0', 10);
        stopAutoPlay();
        scrollToIndex(idx);
        startAutoPlay();
      });
    });

    // User Manual Touch / Swipe Handling
    track.addEventListener('touchstart', () => {
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', () => {
      // Resume autoplay after user lifts finger
      setTimeout(startAutoPlay, 1200);
    }, { passive: true });

    // Track User Touch Scroll via Debounced Scroll Listener
    let scrollDebounceTimeout = null;
    track.addEventListener('scroll', () => {
      // If scroll was triggered programmatically by scrollToIndex, ignore it
      if (isAutoScrolling) return;

      stopAutoPlay();
      if (scrollDebounceTimeout) clearTimeout(scrollDebounceTimeout);
      scrollDebounceTimeout = setTimeout(() => {
        const scrollLeft = track.scrollLeft;
        const trackWidth = track.clientWidth || window.innerWidth;
        const newIndex = Math.round(scrollLeft / trackWidth);
        if (newIndex >= 0 && newIndex < slides.length && newIndex !== currentIndex) {
          updateUI(newIndex);
        }
        startAutoPlay();
      }, 100);
    }, { passive: true });

    // Initialize UI on Mount
    updateUI(0);
    startAutoPlay();
  }`;

// Find the whole script block
const scriptStartTag = '<script is:inline>';
const scriptEndTag = '</script>';

const scriptStartPos = content.indexOf(scriptStartTag);
const scriptEndPos = content.indexOf(scriptEndTag, scriptStartPos);

if (scriptStartPos === -1 || scriptEndPos === -1) {
  console.error('Could not find script block in StoreHero.astro');
  process.exit(1);
}

const newScriptBlock = `<script is:inline>
${newScriptImplementation}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProtocolHeroSwitcher);
  } else {
    initProtocolHeroSwitcher();
  }
  document.addEventListener('astro:page-load', initProtocolHeroSwitcher);
</script>`;

content = content.slice(0, scriptStartPos) + newScriptBlock + content.slice(scriptEndPos + scriptEndTag.length);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: StoreHero.astro updated with bulletproof auto-sliding engine!');

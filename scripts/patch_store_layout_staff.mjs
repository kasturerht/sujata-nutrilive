import fs from 'fs';

const filePath = 'src/layouts/StoreLayout.astro';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Patch Head (Staff Check & Conditional Tracking)
const headTarget = `    <!-- Google Consent Mode v2 (Enterprise Global Standard - Default Granted) -->
    <script is:inline>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('consent', 'default', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted',
        'functionality_storage': 'granted',
        'personalization_storage': 'granted',
        'security_storage': 'granted',
        'wait_for_update': 500
      });
    </script>
    <!-- Google Tag Manager -->
    <script is:inline>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5BCC6JL8');</script>
    <!-- End Google Tag Manager -->`;

const headReplacement = `    <!-- 🛡️ Internal Staff Exclusion & Google Consent Mode v2 -->
    <script is:inline>
      (function() {
        try {
          var params = new URLSearchParams(window.location.search);
          if (params.get('internal_staff') === 'true') {
            localStorage.setItem('sujata_staff_mode', 'true');
            document.cookie = 'sujata_staff_mode=true;path=/;max-age=31536000;SameSite=Lax';
            alert('🛡️ Sujata Staff Mode Active!\\nYour visits and clicks on this browser will NOT be tracked in GA4 or Meta Ads.');
          } else if (params.get('internal_staff') === 'false') {
            localStorage.removeItem('sujata_staff_mode');
            document.cookie = 'sujata_staff_mode=;path=/;max-age=0;SameSite=Lax';
            alert('🔄 Sujata Staff Mode Deactivated.\\nTracking has been restored for this browser.');
          }
        } catch(e) {}
      })();

      var isInternalStaff = false;
      try {
        isInternalStaff = localStorage.getItem('sujata_staff_mode') === 'true' || document.cookie.indexOf('sujata_staff_mode=true') !== -1;
      } catch(e) {}
      window.__SUJATA_STAFF__ = isInternalStaff;

      if (isInternalStaff) {
        window['ga-disable-G-5WZ8DNW2PD'] = true;
        console.log('🛡️ [Sujata Analytics] Internal Staff Mode detected. GA4 & Meta Tracking DISABLED for this session.');
      } else {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('consent', 'default', {
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted',
          'analytics_storage': 'granted',
          'functionality_storage': 'granted',
          'personalization_storage': 'granted',
          'security_storage': 'granted',
          'wait_for_update': 500
        });
      }
    </script>
    <!-- Google Tag Manager -->
    <script is:inline>
      if (!window.__SUJATA_STAFF__) {
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-5BCC6JL8');
      }
    </script>
    <!-- End Google Tag Manager -->`;

// Normalize line endings for replacement
const normalize = (s) => s.replace(/\r\n/g, '\n');

if (normalize(content).includes(normalize(headTarget))) {
  content = normalize(content).replace(normalize(headTarget), headReplacement);
  console.log('✅ Patched <head> with Staff Mode logic.');
} else {
  console.error('❌ Could not find headTarget in StoreLayout.astro');
}

// 2. Patch window.dispatchStoreEvent
const dispatchTarget = `      window.dispatchStoreEvent = function(eventName, data) {
        data = data || {};
        window.dataLayer = window.dataLayer || [];`;

const dispatchReplacement = `      window.dispatchStoreEvent = function(eventName, data) {
        if (window.__SUJATA_STAFF__) {
          console.log('🛡️ [Staff Mode - Event Suppressed]:', eventName);
          return;
        }
        data = data || {};
        window.dataLayer = window.dataLayer || [];`;

if (normalize(content).includes(normalize(dispatchTarget))) {
  content = normalize(content).replace(normalize(dispatchTarget), dispatchReplacement);
  console.log('✅ Patched dispatchStoreEvent to suppress staff events.');
} else {
  console.error('❌ Could not find dispatchTarget in StoreLayout.astro');
}

// 3. Add visual indicator before </body>
const bodyTarget = `  </body>`;
const bodyReplacement = `    <!-- 🛡️ Staff Mode Indicator Badge -->
    <script is:inline>
      if (window.__SUJATA_STAFF__) {
        var badge = document.createElement('div');
        badge.id = 'sujata-staff-indicator';
        badge.innerHTML = '🛡️ Staff Mode (Tracking OFF)';
        badge.style.cssText = 'position:fixed;bottom:12px;left:12px;background:#064E3B;color:#D1FAE5;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer;border:1px solid #10B981;font-family:system-ui,sans-serif;letter-spacing:0.3px;';
        badge.title = 'Click to disable Staff Mode and restore analytics tracking';
        badge.onclick = function() {
          if (confirm('Disable Staff Mode and restore analytics tracking for this browser?')) {
            window.location.href = window.location.pathname + '?internal_staff=false';
          }
        };
        document.body.appendChild(badge);
      }
    </script>
  </body>`;

if (normalize(content).includes(normalize(bodyTarget))) {
  content = normalize(content).replace(normalize(bodyTarget), bodyReplacement);
  console.log('✅ Added Staff Mode Indicator Badge before </body>.');
} else {
  console.error('❌ Could not find bodyTarget in StoreLayout.astro');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 StoreLayout.astro successfully updated!');

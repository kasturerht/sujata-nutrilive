import fs from 'fs';

const filePath = 'src/layouts/StoreLayout.astro';
let content = fs.readFileSync(filePath, 'utf8');

// Remove the badge block completely
const badgeTarget = `    <!-- 🛡️ Staff Mode Indicator Badge -->
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

const normalize = (s) => s.replace(/\r\n/g, '\n');

if (normalize(content).includes(normalize(badgeTarget))) {
  content = normalize(content).replace(normalize(badgeTarget), '  </body>');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Successfully removed Staff Mode badge from StoreLayout.astro!');
} else {
  console.error('❌ Could not find badgeTarget in StoreLayout.astro');
}

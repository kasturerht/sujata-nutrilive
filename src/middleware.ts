import { defineMiddleware } from 'astro:middleware';

// 🤖 Real-Time AI Bot & LLM Crawler Detection Engine
const AI_BOT_MAP: Record<string, string> = {
  'OAI-SearchBot': 'OpenAI SearchGPT 🔍',
  'GPTBot': 'ChatGPT Knowledge Crawler 🧠',
  'ChatGPT-User': 'ChatGPT Real-Time User 💬',
  'PerplexityBot': 'Perplexity AI Search 🔮',
  'ClaudeBot': 'Anthropic Claude AI 🤖',
  'anthropic-ai': 'Anthropic AI Assistant 🤖',
  'Google-Extended': 'Google Gemini Training 🔬',
  'GoogleOther': 'Google AI Research 🌐',
  'Applebot-Extended': 'Apple Intelligence 🍎',
  'Bytespider': 'TikTok Doubao AI 📱',
  'CCBot': 'Common Crawl Global Dataset 📚',
  'cohere-ai': 'Cohere AI 🏢'
};

// In-memory cooldown cache: key = `${bot}_${pathname}`, value = timestamp
const recentAlerts = new Map<string, number>();

export const onRequest = defineMiddleware(async (context, next) => {
  const request = context.request;
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = context.url.pathname;

  let detectedBot: string | null = null;
  let botLabel: string | null = null;

  for (const [key, label] of Object.entries(AI_BOT_MAP)) {
    if (userAgent.includes(key)) {
      detectedBot = key;
      botLabel = label;
      break;
    }
  }

  // Execute request
  const response = await next();

  // If an AI Bot is detected
  if (detectedBot && botLabel) {
    response.headers.set('X-AI-Engine-Tracked', detectedBot);

    // Skip static assets (e.g. images, css, favicon)
    const isPage = !pathname.includes('.') || pathname.endsWith('.html') || pathname.endsWith('.xml') || pathname.endsWith('.txt');
    if (isPage) {
      const cacheKey = `${detectedBot}:${pathname}`;
      const lastAlert = recentAlerts.get(cacheKey) || 0;
      const now = Date.now();

      // Only alert once per 10 minutes per bot per page
      if (now - lastAlert > 10 * 60 * 1000) {
        recentAlerts.set(cacheKey, now);

        // Prune map if too large
        if (recentAlerts.size > 200) {
          for (const [k, v] of recentAlerts.entries()) {
            if (now - v > 60 * 60 * 1000) recentAlerts.delete(k);
          }
        }

        // Send fire-and-forget alert to Telegram
        const botToken = '8922846279:AAFZXUeM6lZc4t0x1AtKjOwPHAE0IBeugSI';
        const chatId = '847419012';
        const timeStr = new Date(now + 5.5 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19) + ' IST';
        
        const message = `🤖 <b>AI BOT CRAWL DETECTED!</b>\n\n` +
          `🔹 <b>Engine:</b> ${botLabel}\n` +
          `📄 <b>Page Read:</b> <code>${pathname}</code>\n` +
          `⚡ <b>HTTP Status:</b> ${response.status}\n` +
          `🕒 <b>Time:</b> ${timeStr}\n\n` +
          `<i>Sujata Nutrilive GEO Real-time Radar</i>`;

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
        }).catch(() => {});
      }
    }
  }

  // Cache static and marketing/product pages on Vercel Edge CDN
  if (context.request.method === 'GET' && response.status === 200) {
    if (!pathname.startsWith('/api/') && !pathname.startsWith('/cart') && !pathname.startsWith('/checkout')) {
      response.headers.set('Cache-Control', 'public, max-age=120, s-maxage=86400, stale-while-revalidate=604800');
    }
  }

  return response;
});

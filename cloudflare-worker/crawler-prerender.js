/**
 * Cloudflare Worker: Crawler Prerender Proxy for SiliconSoap
 * 
 * Detects social media/search/AI crawlers and serves prerendered HTML
 * with proper OG tags, while regular users get the React SPA.
 * 
 * Deploy instructions:
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Paste this code and deploy
 * 3. Add route: siliconsoap.com/shared/* → this worker
 * 
 * @version 1.0.0
 * @updated 2026-01-20
 */

const SUPABASE_URL = 'https://apfrjuomozdvdeondzaz.supabase.co';
const ORIGIN_URL = 'https://siliconsoap.com';

// Comprehensive list of crawler user agents
const CRAWLER_PATTERNS = [
  // Social Media Crawlers
  /Twitterbot/i,
  /facebookexternalhit/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /Discordbot/i,
  /PinterestBot/i,
  /Mastodon/i,
  /Bluesky/i,
  
  // Search Engine Crawlers
  /Googlebot/i,
  /Bingbot/i,
  /Baiduspider/i,
  /YandexBot/i,
  /DuckDuckBot/i,
  /Sogou/i,
  /Applebot/i,
  
  // AI/Answer Engine Crawlers (AEO)
  /GPTBot/i,
  /ChatGPT-User/i,
  /Claude-Web/i,
  /PerplexityBot/i,
  /Grok/i,
  /anthropic-ai/i,
  /cohere-ai/i,
  /Google-Extended/i,
  /CCBot/i,
  /Amazonbot/i,
  
  // Preview/Embed Services
  /Embedly/i,
  /Quora-Bot/i,
  /Iframely/i,
  /outbrain/i,
  /W3C_Validator/i,
  /Validator\.nu/i,
  
  // Generic Bot Patterns
  /bot/i,
  /crawl/i,
  /spider/i,
  /preview/i,
];

/**
 * Check if the user agent matches any known crawler
 */
function isCrawler(userAgent) {
  if (!userAgent) return false;
  return CRAWLER_PATTERNS.some(pattern => pattern.test(userAgent));
}

/**
 * Extract shareId from path like /shared/abc123
 */
function extractShareId(pathname) {
  const match = pathname.match(/^\/shared\/([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}

/**
 * Main request handler
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  
  // Only intercept /shared/:shareId routes
  const shareId = extractShareId(url.pathname);
  
  if (!shareId) {
    // Not a shared route - pass through to origin
    return fetch(request);
  }
  
  // Log for debugging (visible in Cloudflare dashboard)
  console.log(`[Prerender] Path: ${url.pathname}, UA: ${userAgent.substring(0, 50)}...`);
  
  // Check if this is a crawler
  if (isCrawler(userAgent)) {
    console.log(`[Prerender] Crawler detected, serving prerendered HTML`);
    
    try {
      // Fetch prerendered HTML from Supabase Edge Function
      const prerenderUrl = `${SUPABASE_URL}/functions/v1/prerender?shareId=${shareId}`;
      
      const prerenderResponse = await fetch(prerenderUrl, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html',
        },
      });
      
      if (!prerenderResponse.ok) {
        console.log(`[Prerender] Edge function returned ${prerenderResponse.status}, falling back to origin`);
        return fetch(request);
      }
      
      // Get the HTML and return with proper headers
      const html = await prerenderResponse.text();
      
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          'X-Prerendered': 'true',
          'X-Crawler-Detected': userAgent.substring(0, 100),
        },
      });
      
    } catch (error) {
      console.error(`[Prerender] Error fetching prerendered content:`, error);
      // Fall back to origin on error
      return fetch(request);
    }
  }
  
  // Regular user - pass through to origin (React SPA)
  console.log(`[Prerender] Regular user, passing to SPA`);
  return fetch(request);
}

// Cloudflare Workers entry point
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// For newer Workers using ES modules syntax (optional alternative):
// export default {
//   async fetch(request, env, ctx) {
//     return handleRequest(request);
//   },
// };

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Crawler user agents that need prerendered content
const CRAWLER_USER_AGENTS = [
  // Social media crawlers
  'Twitterbot',
  'facebookexternalhit',
  'LinkedInBot',
  'Slackbot',
  'WhatsApp',
  'TelegramBot',
  'Discordbot',
  // Search engine crawlers
  'Googlebot',
  'Bingbot',
  'Baiduspider',
  'YandexBot',
  'DuckDuckBot',
  // AI crawlers (AEO)
  'GPTBot',
  'ChatGPT-User',
  'Claude-Web',
  'PerplexityBot',
  'Grok',
  'anthropic-ai',
  'cohere-ai',
  // Other bots
  'Applebot',
  'PinterestBot',
  'Embedly',
  'Quora-Bot',
  'Mastodon',
];

const SUPABASE_URL = 'https://apfrjuomozdvdeondzaz.supabase.co';
const SITE_URL = 'https://siliconsoap.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { shareId } = req.query;
  const userAgent = req.headers['user-agent'] || '';

  if (!shareId || typeof shareId !== 'string') {
    return res.status(400).send('Missing shareId');
  }

  // Check if request is from a crawler
  const isCrawler = CRAWLER_USER_AGENTS.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  if (isCrawler) {
    // Fetch prerendered HTML from edge function
    try {
      const prerenderUrl = `${SUPABASE_URL}/functions/v1/prerender?shareId=${shareId}`;
      const response = await fetch(prerenderUrl);
      
      if (!response.ok) {
        // Fallback: redirect to SPA
        return res.redirect(302, `${SITE_URL}/shared/${shareId}`);
      }

      const html = await response.text();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      return res.status(200).send(html);
    } catch (error) {
      console.error('Prerender fetch error:', error);
      return res.redirect(302, `${SITE_URL}/shared/${shareId}`);
    }
  }

  // Regular users: redirect to SPA
  return res.redirect(302, `${SITE_URL}/shared/${shareId}`);
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Social media and AI crawler user agents
const CRAWLER_USER_AGENTS = [
  // Social media crawlers
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Pinterest',
  'Slackbot',
  'TelegramBot',
  'WhatsApp',
  'Discordbot',
  'Googlebot',
  'bingbot',
  
  // AI/LLM crawlers (AEO - Answer Engine Optimization)
  'PerplexityBot',
  'GPTBot',
  'ChatGPT-User',
  'Claude-Web',
  'ClaudeBot',
  'Anthropic-AI',
  'CCBot',              // Common Crawl
  'cohere-ai',          // Cohere
  'Grok',               // xAI Grok
  'Meta-ExternalAgent', // Meta AI
  'Bytespider',         // ByteDance/TikTok AI
  'Amazonbot',          // Amazon Alexa/AI
  'YouBot',             // You.com
  'Applebot',           // Apple/Siri
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // Only handle /shared/:shareId routes
  if (!pathname.startsWith('/shared/')) {
    return NextResponse.next();
  }

  // Check if request is from a social crawler
  const isCrawler = CRAWLER_USER_AGENTS.some(agent => 
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );

  if (isCrawler) {
    // Extract shareId from path
    const shareId = pathname.replace('/shared/', '');
    
    // Rewrite to prerender API route
    const url = request.nextUrl.clone();
    url.pathname = `/api/prerender/${shareId}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/shared/:path*',
};

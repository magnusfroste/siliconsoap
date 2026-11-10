// Cloudflare Worker on the custom domain share.siliconsoap.com
// Link-preview crawlers can't run the SPA, so they get the server-rendered
// `prerender` page (title, description, og:image). Everyone else is sent to the debate.
const SITE = 'https://siliconsoap.com';
const SHARE_HOST = 'https://share.siliconsoap.com';
const PRERENDER = 'https://apfrjuomozdvdeondzaz.supabase.co/functions/v1/prerender?shareId=';

// Preview crawlers only: search engines should index the main site, not this host.
const BOTS = /linkedinbot|facebookexternalhit|facebot|meta-externalagent|twitterbot|slackbot|slack-imgproxy|discordbot|telegrambot|whatsapp|skypeuripreview|microsoftpreview|teams|redditbot|mastodon|bluesky|embedly|iframely|pinterest|vkshare/i;

// Crawlers follow og:url, canonical and meta refresh, and the main site would
// answer those with homepage tags. Keep them on this host.
function pinToShareHost(html, id) {
  const siteUrl = `${SITE}/shared/${id}`;
  const shareUrl = `${SHARE_HOST}/${id}`;
  return html
    .replace(/<meta http-equiv="refresh"[^>]*>\s*/i, '')
    .replace(/<script>window\.location\.href[^<]*<\/script>\s*/i, '')
    .replace(`<link rel="canonical" href="${siteUrl}">`, `<link rel="canonical" href="${shareUrl}">`)
    .replace(`<meta property="og:url" content="${siteUrl}">`, `<meta property="og:url" content="${shareUrl}">`)
    .replace(`<meta name="twitter:url" content="${siteUrl}">`, `<meta name="twitter:url" content="${shareUrl}">`);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/(?:shared\/)?([A-Za-z0-9_-]{4,32})\/?$/);
    if (!match) return Response.redirect(SITE, 302);

    const id = match[1];
    const target = `${SITE}/shared/${id}${url.search}`;
    const ua = request.headers.get('user-agent') || '';

    if ((request.method === 'GET' || request.method === 'HEAD') && BOTS.test(ua)) {
      try {
        const res = await fetch(PRERENDER + id, { cf: { cacheTtl: 600, cacheEverything: true } });
        if (res.ok) {
          return new Response(pinToShareHost(await res.text(), id), {
            status: 200,
            headers: {
              'content-type': 'text/html; charset=utf-8',
              'cache-control': 'public, max-age=600',
              'x-share-preview': 'prerender',
            },
          });
        }
      } catch {
        // fall through to the debate page
      }
    }
    return Response.redirect(target, 302);
  },
};

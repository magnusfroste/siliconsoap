import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://apfrjuomozdvdeondzaz.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZnJqdW9tb3pkdmRlb25kemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTQ4MzAsImV4cCI6MjA3OTY3MDgzMH0.wtSVuTKB_w46FfUNjn1t9-wW8fNPxuln3AfYhl10xbo';
const BASE_URL = 'https://siliconsoap.com';

interface ChatData {
  id: string;
  title: string;
  prompt: string;
  scenario_id: string;
  settings: any;
  view_count?: number;
}

interface MessageData {
  agent: string;
  model: string;
  persona: string;
  message: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { shareId } = req.query;

  if (!shareId || typeof shareId !== 'string') {
    return res.status(400).send('Missing shareId');
  }

  try {
    // Fetch chat data from Supabase
    const chatResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/get_shared_chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ p_share_id: shareId }),
      }
    );

    const chatData = await chatResponse.json();
    
    if (!chatData || chatData.length === 0) {
      return res.status(404).send(generateErrorHtml('Debate not found'));
    }

    const chat: ChatData = chatData[0];

    // Fetch messages
    const messagesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/agent_chat_messages?chat_id=eq.${chat.id}&order=created_at.asc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const messages: MessageData[] = await messagesResponse.json();

    // Extract unique agents and models
    const agents = [...new Set(messages.map(m => m.agent))];
    const models = [...new Set(messages.map(m => m.model))];

    // Generate meta tags
    const title = escapeHtml(chat.title || 'AI Debate');
    const description = escapeHtml(
      chat.prompt.length > 155 
        ? chat.prompt.substring(0, 155) + '...' 
        : chat.prompt
    );
    const ogImageUrl = `${SUPABASE_URL}/functions/v1/generate-og-image?shareId=${shareId}`;
    const canonicalUrl = `${BASE_URL}/shared/${shareId}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${title} | SiliconSoap</title>
  <meta name="title" content="${title} | SiliconSoap">
  <meta name="description" content="${description}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title} | SiliconSoap">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:site_name" content="SiliconSoap">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title} | SiliconSoap">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImageUrl}">
  
  <!-- Additional Meta -->
  <meta name="robots" content="index, follow">
  <meta name="author" content="SiliconSoap">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "headline": "${title}",
    "text": "${escapeHtml(chat.prompt)}",
    "url": "${canonicalUrl}",
    "author": {
      "@type": "Organization",
      "name": "SiliconSoap"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SiliconSoap",
      "url": "${BASE_URL}"
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ViewAction",
      "userInteractionCount": ${chat.view_count || 0}
    },
    "about": [
      ${agents.map(a => `{"@type": "Thing", "name": "${escapeHtml(a)}"}`).join(',\n      ')}
    ]
  }
  </script>
  
  <!-- Redirect for non-crawler browsers -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <script>window.location.href = "${canonicalUrl}";</script>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>Featuring ${agents.length} AI agents: ${agents.join(', ')}</p>
  <p>Models: ${models.join(', ')}</p>
  <p>${messages.length} messages in this debate</p>
  <p><a href="${canonicalUrl}">View this debate on SiliconSoap</a></p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Prerender error:', error);
    return res.status(500).send(generateErrorHtml('Error loading debate'));
  }
}

function generateErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${message} | SiliconSoap</title>
  <meta name="robots" content="noindex">
</head>
<body>
  <h1>${message}</h1>
  <p><a href="https://siliconsoap.com">Visit SiliconSoap</a></p>
</body>
</html>`;
}

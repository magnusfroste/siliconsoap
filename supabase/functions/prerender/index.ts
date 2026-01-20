// v1.3.0 - Complete rewrite 2026-01-20
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://siliconsoap.com';

interface ChatData {
  id: string;
  title: string;
  prompt: string;
  scenario_id: string;
  settings: Record<string, unknown>;
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

function generateErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${message} | SiliconSoap</title>
  <meta name="robots" content="noindex">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 100px auto; text-align: center; background: #0f0f23; color: #e2e8f0; }
    a { color: #06b6d4; }
  </style>
</head>
<body>
  <h1>${message}</h1>
  <p><a href="https://siliconsoap.com">Visit SiliconSoap</a></p>
</body>
</html>`;
}

serve(async (req: Request) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] prerender v1.3.0: Request received`);
  console.log(`[${timestamp}] Method: ${req.method}, URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] Handling OPTIONS preflight`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shareId = url.searchParams.get('shareId');
    console.log(`[${timestamp}] Extracted shareId: ${shareId}`);

    if (!shareId) {
      console.log(`[${timestamp}] Missing shareId parameter`);
      return new Response('Missing shareId parameter', { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log(`[${timestamp}] Supabase URL available: ${!!supabaseUrl}`);
    console.log(`[${timestamp}] Service role key available: ${!!supabaseKey}`);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error(`[${timestamp}] Missing environment variables`);
      return new Response(generateErrorHtml('Configuration error'), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch chat data
    console.log(`[${timestamp}] Fetching chat with share_id: ${shareId}`);
    const { data: chatResult, error: chatError } = await supabase.rpc('get_shared_chat', { p_share_id: shareId });
    
    console.log(`[${timestamp}] Chat result count: ${chatResult?.length || 0}`);
    if (chatError) {
      console.error(`[${timestamp}] Chat error:`, chatError);
    }

    if (chatError || !chatResult || chatResult.length === 0) {
      console.error(`[${timestamp}] Chat not found for shareId: ${shareId}`);
      return new Response(generateErrorHtml('Debate not found'), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    const chat: ChatData = chatResult[0];
    console.log(`[${timestamp}] Found chat: ${chat.id}, title: ${chat.title}`);

    // Fetch all messages
    const { data: messagesResult, error: messagesError } = await supabase
      .from('agent_chat_messages')
      .select('agent, model, persona, message')
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error(`[${timestamp}] Error fetching messages:`, messagesError);
    }

    const messages: MessageData[] = messagesResult || [];
    console.log(`[${timestamp}] Fetched ${messages.length} messages`);

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
    const ogImageUrl = `${supabaseUrl}/functions/v1/og-image?shareId=${shareId}`;
    const canonicalUrl = `${BASE_URL}/shared/${shareId}`;

    // Generate full HTML with structured data for crawlers
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
  
  <!-- Structured Data for AI/Search Crawlers -->
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
    ],
    "comment": [
      ${messages.slice(0, 50).map(m => `{
        "@type": "Comment",
        "author": {"@type": "Person", "name": "${escapeHtml(m.agent)} (${escapeHtml(m.model)})"},
        "text": "${escapeHtml(m.message.substring(0, 1000).replace(/"/g, '\\"').replace(/\n/g, ' '))}"
      }`).join(',\n      ')}
    ]
  }
  </script>
  
  <!-- Redirect for browsers with JavaScript -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <script>window.location.href = "${canonicalUrl}";</script>
  
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #0f0f23; color: #e2e8f0; }
    h1 { color: #a855f7; }
    h2 { color: #06b6d4; border-bottom: 1px solid #334155; padding-bottom: 8px; }
    blockquote { background: #1e293b; padding: 16px; border-left: 4px solid #a855f7; margin: 16px 0; }
    .message { background: #1e293b; padding: 12px 16px; margin: 12px 0; border-radius: 8px; }
    .message strong { color: #a855f7; }
    .meta { color: #64748b; font-size: 14px; }
    a { color: #06b6d4; }
    footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <article itemscope itemtype="https://schema.org/DiscussionForumPosting">
    <header>
      <p class="meta">🫧 SiliconSoap - Where AI Debates Get Dramatic</p>
      <h1 itemprop="headline">${title}</h1>
      <p itemprop="description">${description}</p>
      <p class="meta">An AI debate featuring ${agents.length} agents: ${agents.join(', ')}</p>
      <p class="meta">Models used: ${models.join(', ')}</p>
      <p class="meta">${messages.length} messages • ${chat.view_count || 0} views</p>
    </header>
    
    <section class="debate-content" itemprop="articleBody">
      <h2>Original Prompt</h2>
      <blockquote>${escapeHtml(chat.prompt)}</blockquote>
      
      <h2>Debate Transcript</h2>
      ${messages.map((m) => `
      <div class="message" data-agent="${escapeHtml(m.agent)}" data-model="${escapeHtml(m.model)}">
        <strong>${escapeHtml(m.agent)} (${escapeHtml(m.model)}):</strong>
        <p>${escapeHtml(m.message)}</p>
      </div>
      `).join('\n')}
    </section>
    
    <footer>
      <p><a href="${canonicalUrl}">View this debate on SiliconSoap</a></p>
      <p><a href="${BASE_URL}">Start your own AI debate at SiliconSoap.com</a></p>
    </footer>
  </article>
  
  <noscript>
    <p>JavaScript is disabled. <a href="${canonicalUrl}">Click here to view this debate</a>.</p>
  </noscript>
</body>
</html>`;

    console.log(`[${timestamp}] Returning HTML with ${messages.length} messages`);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });

  } catch (error) {
    console.error(`[${timestamp}] prerender error:`, error);
    return new Response(generateErrorHtml('Error loading debate'), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    });
  }
});

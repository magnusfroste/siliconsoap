// v2.1.0 - Updated 2026-01-20
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('generate-og-image: Request received');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shareId = url.searchParams.get('shareId');
    console.log('generate-og-image: shareId =', shareId);

    if (!shareId) {
      return new Response('Missing shareId parameter', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Fetch chat data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: chat, error } = await supabase.rpc('get_shared_chat', { p_share_id: shareId });
    console.log('generate-og-image: chat result =', chat, 'error =', error);

    if (error || !chat || chat.length === 0) {
      console.error('Chat not found:', error);
      return new Response('Chat not found', { status: 404, headers: corsHeaders });
    }

    const chatData = chat[0];
    
    // Fetch messages to get agent/model info
    const { data: messages } = await supabase
      .from('agent_chat_messages')
      .select('agent, model, persona')
      .eq('chat_id', chatData.id)
      .limit(10);

    // Get unique agents and models
    const agents = [...new Set(messages?.map(m => m.agent) || [])];
    const models = [...new Set(messages?.map(m => m.model?.split('/').pop()?.slice(0, 20)) || [])];

    // Generate SVG-based OG image
    const title = chatData.title || 'AI Debate';
    const truncatedTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
    const prompt = chatData.prompt || '';
    const truncatedPrompt = prompt.length > 100 ? prompt.slice(0, 97) + '...' : prompt;
    
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f0f23"/>
            <stop offset="50%" style="stop-color:#1a1a3e"/>
            <stop offset="100%" style="stop-color:#2d1b4e"/>
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#a855f7"/>
            <stop offset="50%" style="stop-color:#06b6d4"/>
            <stop offset="100%" style="stop-color:#ec4899"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)"/>
        
        <!-- Decorative bubbles -->
        <circle cx="100" cy="100" r="60" fill="#a855f7" opacity="0.1"/>
        <circle cx="1100" cy="530" r="80" fill="#06b6d4" opacity="0.1"/>
        <circle cx="900" cy="150" r="40" fill="#ec4899" opacity="0.15"/>
        
        <!-- Header line -->
        <rect x="60" y="60" width="200" height="4" fill="url(#accent)" rx="2"/>
        
        <!-- Logo/Brand -->
        <text x="60" y="110" font-family="Inter, system-ui, sans-serif" font-size="28" font-weight="600" fill="#a855f7">🫧 SiliconSoap</text>
        
        <!-- Title -->
        <text x="60" y="220" font-family="Inter, system-ui, sans-serif" font-size="48" font-weight="700" fill="#ffffff">${escapeXml(truncatedTitle)}</text>
        
        <!-- Prompt preview -->
        <text x="60" y="290" font-family="Inter, system-ui, sans-serif" font-size="24" fill="#94a3b8">"${escapeXml(truncatedPrompt)}"</text>
        
        <!-- Agents info -->
        <text x="60" y="400" font-family="Inter, system-ui, sans-serif" font-size="20" fill="#64748b">Featuring:</text>
        ${agents.map((agent, i) => `
          <rect x="${60 + i * 140}" y="420" width="120" height="40" rx="20" fill="${i === 0 ? '#a855f7' : i === 1 ? '#3b82f6' : '#22c55e'}" opacity="0.2"/>
          <text x="${120 + i * 140}" y="447" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="500" fill="${i === 0 ? '#a855f7' : i === 1 ? '#3b82f6' : '#22c55e'}" text-anchor="middle">${agent}</text>
        `).join('')}
        
        <!-- Models -->
        <text x="60" y="520" font-family="Inter, system-ui, sans-serif" font-size="16" fill="#64748b">Models: ${escapeXml(models.join(' • '))}</text>
        
        <!-- CTA -->
        <rect x="60" y="560" width="280" height="50" rx="25" fill="url(#accent)"/>
        <text x="200" y="593" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="600" fill="#ffffff" text-anchor="middle">Watch the Debate →</text>
        
        <!-- Footer tagline -->
        <text x="1140" y="600" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#64748b" text-anchor="end">Where AI Debates Get Dramatic</text>
      </svg>
    `;

    console.log('generate-og-image: Returning SVG');
    
    // Return SVG as image
    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

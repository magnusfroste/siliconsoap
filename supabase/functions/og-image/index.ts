// v3.0.0 - PNG output via og_edge (Satori + resvg) 2026-11-01
import { ImageResponse } from "https://deno.land/x/og_edge@0.0.6/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OG_FALLBACK_IMAGE, modelLabels, truncate } from "../_shared/sharePreview.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FONT_URLS = {
  regular: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff',
  bold: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff',
};
let fontCache: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | null = null;
function loadFonts() {
  if (!fontCache) {
    fontCache = Promise.all([
      fetch(FONT_URLS.regular).then((r) => { if (!r.ok) throw new Error('font'); return r.arrayBuffer(); }),
      fetch(FONT_URLS.bold).then((r) => { if (!r.ok) throw new Error('font'); return r.arrayBuffer(); }),
    ]).then(([regular, bold]) => ({ regular, bold }));
    fontCache.catch(() => { fontCache = null; });
  }
  return fontCache;
}

// Minimal hyperscript for Satori (no JSX needed).
// deno-lint-ignore no-explicit-any
type El = any;
function h(type: string, style: Record<string, unknown>, ...children: (El | string)[]): El {
  return { type, props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children } };
}

const CHIP_COLORS = ['#a855f7', '#06b6d4', '#ec4899', '#22c55e'];

function fallback(): Response {
  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, Location: OG_FALLBACK_IMAGE, 'Cache-Control': 'public, max-age=3600' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const shareId = new URL(req.url).searchParams.get('shareId');
    if (!shareId || shareId.length > 64) return fallback();

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    // get_shared_chat only returns public, non-deleted chats.
    const { data: chat, error } = await supabase.rpc('get_shared_chat', { p_share_id: shareId });
    if (error || !chat || chat.length === 0) return fallback();
    const chatData = chat[0];

    const { data: messages } = await supabase
      .from('agent_chat_messages')
      .select('model')
      .eq('chat_id', chatData.id)
      .limit(50);
    const modelIds = [...new Set((messages || []).map((m: { model: string }) => m.model).filter(Boolean))] as string[];
    const names: Record<string, string> = {};
    if (modelIds.length) {
      const { data: curated } = await supabase.from('curated_models').select('model_id, display_name').in('model_id', modelIds);
      for (const c of curated || []) if (c.display_name) names[c.model_id] = c.display_name;
    }
    const models = modelLabels(modelIds, names).slice(0, 4);
    const isPanel = (chatData.settings as Record<string, unknown> | null)?.mode === 'panel';

    const title = truncate(chatData.prompt || chatData.title || 'AI Debate', 120);
    const fonts = await loadFonts();

    const element = h(
      'div',
      {
        width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between',
        padding: '64px 72px', fontFamily: 'Inter', color: '#ffffff',
        backgroundImage: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%)',
      },
      h('div', { flexDirection: 'column' },
        h('div', { width: 200, height: 6, borderRadius: 3, backgroundImage: 'linear-gradient(90deg, #a855f7, #06b6d4, #ec4899)' }, ''),
        h('div', { marginTop: 24, alignItems: 'center', fontSize: 30, fontWeight: 700, color: '#c084fc' },
          h('div', { width: 22, height: 22, borderRadius: 11, border: '3px solid #06b6d4', marginRight: 12 }, ''),
          'SiliconSoap',
          h('div', { marginLeft: 20, fontSize: 22, fontWeight: 400, color: '#94a3b8' }, isPanel ? 'AI panel' : 'AI debate'),
        ),
      ),
      h('div', {
        fontSize: title.length > 80 ? 46 : 56, fontWeight: 700, lineHeight: 1.2,
        maxHeight: 220, overflow: 'hidden', lineClamp: 3,
      }, title),
      h('div', { flexDirection: 'column' },
        h('div', { fontSize: 20, color: '#94a3b8', marginBottom: 14 }, models.length ? `${models.length} models` : 'Featuring'),
        h('div', { flexWrap: 'wrap' },
          ...(models.length ? models : ['Open-weight AI models']).map((m, i) =>
            h('div', {
              fontSize: 22, fontWeight: 700, padding: '10px 22px', borderRadius: 999, marginRight: 14, marginBottom: 10,
              color: CHIP_COLORS[i % 4], border: `2px solid ${CHIP_COLORS[i % 4]}`, backgroundColor: 'rgba(255,255,255,0.05)',
            }, truncate(m, 28)),
          ),
        ),
      ),
    );

    const img = new ImageResponse(element, {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    });
    const body = await img.arrayBuffer();
    return new Response(body, {
      headers: { ...corsHeaders, 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (error) {
    console.error('og-image error:', error);
    return fallback();
  }
});

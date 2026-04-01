import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://siliconsoap.com";

const STATIC_PAGES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/new", changefreq: "weekly", priority: "0.9" },
  { path: "/explore", changefreq: "daily", priority: "0.8" },
  { path: "/leaderboard", changefreq: "daily", priority: "0.8" },
  { path: "/learn", changefreq: "monthly", priority: "0.7" },
  { path: "/models", changefreq: "weekly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all public shared debates
    const { data: sharedChats, error } = await supabase
      .from("agent_chats")
      .select("share_id, updated_at, created_at")
      .eq("is_public", true)
      .not("share_id", "is", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      console.error("Error fetching shared chats:", error);
    }

    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic shared debate pages
    if (sharedChats) {
      for (const chat of sharedChats) {
        const lastmod = (chat.updated_at || chat.created_at || today).split("T")[0];
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/shared/${chat.share_id}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
});

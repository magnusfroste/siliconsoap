// Provider-agnostic web search wrapper for SiliconSoap agents.
// Supports DuckDuckGo (free, default), Tavily, Brave, and Firecrawl.
// Provider is selected via the `web_search_provider` feature flag in the DB.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function searchDuckDuckGo(query: string, limit: number): Promise<SearchResult[]> {
  // DuckDuckGo Instant Answer API — no key required, free, but limited.
  // We also fall back to the HTML endpoint for richer results.
  const iaUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const results: SearchResult[] = [];

  try {
    const res = await fetch(iaUrl, { headers: { "User-Agent": "SiliconSoap/1.0" } });
    const data = await res.json();

    if (data.AbstractText && data.AbstractURL) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.AbstractText,
      });
    }

    if (Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (results.length >= limit) break;
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(" - ")[0] || topic.Text.slice(0, 80),
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      }
    }
  } catch (e) {
    console.error("DuckDuckGo IA error:", e);
  }

  return results.slice(0, limit);
}

async function searchTavily(query: string, limit: number): Promise<SearchResult[]> {
  const apiKey = Deno.env.get("TAVILY_API_KEY");
  if (!apiKey) throw new Error("TAVILY_API_KEY is not configured");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: limit,
      search_depth: "basic",
    }),
  });

  if (!res.ok) throw new Error(`Tavily ${res.status}: ${await res.text()}`);
  const data = await res.json();

  return (data.results || []).slice(0, limit).map((r: any) => ({
    title: r.title || "",
    url: r.url || "",
    snippet: r.content || r.snippet || "",
  }));
}

async function searchBrave(query: string, limit: number): Promise<SearchResult[]> {
  const apiKey = Deno.env.get("BRAVE_SEARCH_API_KEY");
  if (!apiKey) throw new Error("BRAVE_SEARCH_API_KEY is not configured");

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`;
  const res = await fetch(url, {
    headers: { "X-Subscription-Token": apiKey, Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Brave ${res.status}: ${await res.text()}`);
  const data = await res.json();

  return (data.web?.results || []).slice(0, limit).map((r: any) => ({
    title: r.title || "",
    url: r.url || "",
    snippet: r.description || "",
  }));
}

async function searchFirecrawl(query: string, limit: number): Promise<SearchResult[]> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

  const res = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit }),
  });

  if (!res.ok) throw new Error(`Firecrawl ${res.status}: ${await res.text()}`);
  const data = await res.json();

  const results = data.data || data.web?.results || [];
  return results.slice(0, limit).map((r: any) => ({
    title: r.title || r.metadata?.title || "",
    url: r.url || "",
    snippet: r.description || r.snippet || r.markdown?.slice(0, 200) || "",
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, limit = 3 } = await req.json();

    if (!query || typeof query !== "string" || query.length > 500) {
      return new Response(
        JSON.stringify({ error: "Invalid query (must be 1–500 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve provider + enabled flag from DB
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: flags } = await supabase
      .from("feature_flags")
      .select("key, enabled, text_value")
      .in("key", ["web_search_enabled", "web_search_provider"]);

    const enabled = flags?.find((f) => f.key === "web_search_enabled")?.enabled ?? false;
    const provider = flags?.find((f) => f.key === "web_search_provider")?.text_value ?? "duckduckgo";

    if (!enabled) {
      return new Response(
        JSON.stringify({ enabled: false, results: [], provider }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let results: SearchResult[];
    switch (provider) {
      case "tavily":
        results = await searchTavily(query, limit);
        break;
      case "brave":
        results = await searchBrave(query, limit);
        break;
      case "firecrawl":
        results = await searchFirecrawl(query, limit);
        break;
      case "duckduckgo":
      default:
        results = await searchDuckDuckGo(query, limit);
        break;
    }

    return new Response(
      JSON.stringify({ enabled: true, provider, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("agent-web-search error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        results: [],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

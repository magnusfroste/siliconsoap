// Web search service — calls the agent-web-search edge function.
// Returns structured results that can be injected as research context into agent prompts.
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchResponse {
  enabled: boolean;
  provider: string;
  results: SearchResult[];
  error?: string;
}

export const webSearchService = {
  /**
   * Search the web for context about a debate topic.
   * Returns empty results if web search is disabled in admin settings.
   */
  async search(query: string, limit = 3): Promise<WebSearchResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('agent-web-search', {
        body: { query, limit },
      });

      if (error) {
        console.warn('[webSearchService] error:', error.message);
        return { enabled: false, provider: 'unknown', results: [], error: error.message };
      }

      return data as WebSearchResponse;
    } catch (err) {
      console.warn('[webSearchService] exception:', err);
      return {
        enabled: false,
        provider: 'unknown',
        results: [],
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },

  /**
   * Format search results as a research context block for injection into prompts.
   */
  formatAsResearchContext(results: SearchResult[]): string {
    if (results.length === 0) return '';
    const formatted = results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.url}`)
      .join('\n\n');
    return `\n\nRESEARCH CONTEXT (from live web search — feel free to cite):\n${formatted}\n\nYou may reference these sources by number, e.g. "[1]" or by title. Stay in character but ground factual claims in this evidence when relevant.`;
  },
};

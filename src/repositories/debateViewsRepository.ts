import { supabase } from '@/integrations/supabase/client';

export async function recordDebateView(shareId: string, visitorKey: string): Promise<void> {
  await supabase.rpc('record_debate_view', { p_share_id: shareId, p_visitor_key: visitorKey });
}
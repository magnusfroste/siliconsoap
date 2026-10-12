import { supabase } from '@/integrations/supabase/client';
export async function getProfileOverview(userId:string) {
 const [profile,chats]=await Promise.all([
  supabase.from('user_profiles').select('display_name').eq('user_id',userId).maybeSingle(),
  supabase.from('agent_chats').select('id,title,settings,created_at').eq('user_id',userId).is('deleted_at',null).order('created_at',{ascending:false})
 ]);
 if(profile.error)throw profile.error; if(chats.error)throw chats.error;
 return {displayName:profile.data?.display_name,chats:chats.data??[]};
}

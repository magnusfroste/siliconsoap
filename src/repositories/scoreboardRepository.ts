import { supabase } from '@/integrations/supabase/client';
export interface ModelScore {model_id:string;answers:number;debates:number;public_debates:number;avg_words:number;unsourced_answers:number;tracked_answers:number;self_answered:number}
export async function getModelScoreboard():Promise<ModelScore[]> {const {data,error}=await supabase.rpc('model_scoreboard');if(error)throw error;return data??[];}

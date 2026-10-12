import type { ModelScore } from '@/repositories/scoreboardRepository';
import type { CuratedModel } from '@/models/model';
import { shortModelName } from './rosterService';
export type ScoreSort = 'model'|'answers'|'numbers'|'self'|'length';
export const scorePercent = (n:number,total:number) => total>=20?Math.round(n/total*1000)/10:null;
export function scoreRows(rows:ModelScore[],models:CuratedModel[],retired:boolean,sort:ScoreSort,desc:boolean) {
 const enabled=new Map(models.filter(m=>m.is_enabled).map(m=>[m.model_id,m]));
 const result=rows.filter(r=>retired?!enabled.has(r.model_id):enabled.has(r.model_id)).map(r=>({...r,model:enabled.get(r.model_id)}));
 const value=(r:typeof result[number])=>sort==='model'?shortModelName(r.model?.display_name??r.model_id):sort==='answers'?r.answers:sort==='numbers'?(r.answers?r.unsourced_answers/r.answers:0):sort==='self'?(r.tracked_answers?r.self_answered/r.tracked_answers:0):r.avg_words;
 return result.sort((a,b)=>{const x=value(a),y=value(b);return (typeof x==='string'&&typeof y==='string'?x.localeCompare(y):Number(x)-Number(y))*(desc?-1:1)||a.model_id.localeCompare(b.model_id);});
}

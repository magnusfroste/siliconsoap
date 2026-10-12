import { describe, it, expect } from 'vitest';
import { scorePercent, scoreRows } from '../scoreboardService';
import { isNewModel, filterRoster, contextLabel } from '../rosterService';
import type { CuratedModel } from '@/models/model';
import type { ModelScore } from '@/repositories/scoreboardRepository';
const model={model_id:'eu/a',display_name:'Lab: Alpha',is_enabled:true,license_type:'open-weight',origin_region:'EU',speed_rating:'fast',price_tier:'budget'} as CuratedModel;
const row={model_id:'eu/a',answers:20,debates:4,public_debates:2,avg_words:120,unsourced_answers:5,tracked_answers:20,self_answered:18} satisfies ModelScore;
describe('scoreboard rules',()=>{
 it('withholds percentages below 20 answers',()=>{expect(scorePercent(19,19)).toBeNull();expect(scorePercent(1,0)).toBeNull();});
 it('shows numbers percentages starting at exactly 20',()=>expect(scorePercent(5,20)).toBe(25));
 it('uses tracked answers for self-answer percentages',()=>expect(scorePercent(row.self_answered,row.tracked_answers)).toBe(90));
 it('separates enabled roster models from retired ids',()=>{const retired={...row,model_id:'old/x'};expect(scoreRows([row,retired],[model],false,'answers',true).map(r=>r.model_id)).toEqual(['eu/a']);expect(scoreRows([row,retired],[model],true,'answers',true).map(r=>r.model_id)).toEqual(['old/x']);});
 it('defaults to descending answer count when requested',()=>expect(scoreRows([row,{...row,model_id:'eu/b',answers:30}],[model,{...model,model_id:'eu/b'}],false,'answers',true)[0].answers).toBe(30));
});
describe('roster rules',()=>{
 it('marks only models created within seven days as new',()=>{const now=Date.parse('2026-10-12T18:34:00Z');expect(isNewModel('2026-10-06T18:34:00Z',now)).toBe(true);expect(isNewModel('2026-10-05T18:34:00Z',now)).toBe(false);expect(isNewModel('2026-10-13T18:34:00Z',now)).toBe(false);});
 it('intersects search, license, speed and price tier',()=>{expect(filterRoster([model],'Alpha','open-weight',true,'budget')).toEqual([model]);expect(filterRoster([model],'Alpha','closed',true,'budget')).toEqual([]);expect(filterRoster([model],'Alpha','open-weight',true,'elite')).toEqual([]);});
 it('formats context sizes in K and M',()=>{expect(contextLabel(262144)).toBe('262K');expect(contextLabel(1000000)).toBe('1M');});
});

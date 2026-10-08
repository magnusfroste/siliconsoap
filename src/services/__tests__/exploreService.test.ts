import { describe, expect, it } from 'vitest';
import { completeUniqueDebates, sanitizeQuestionSearch, showdownQuote, matchingModelIds, PAGE_SIZE, type ExploreDebate } from '../exploreService';
import type { CuratedModel } from '@/models/model';
const debate = (id = 'new'): ExploreDebate => ({ id, title:'Question?', prompt:'Question?', share_id:id, created_at:'2026-10-08', featured_at:null, settings:{numberOfAgents:3,rounds:3,models:{agentA:'a',agentB:'b',agentC:'c'}}, agent_chat_messages:[{count:9}], transcript:Array.from({length:9},(_,i) => ({agent:`Agent ${'ABC'[i%3]}`, model:'abc'[i%3], persona:'', message:'', created_at:`2026-10-08T00:00:0${i}Z`})) });
describe('Explore archive rules', () => {
  it('fetches 24 rows per page', () => expect(PAGE_SIZE).toBe(24));
  it('does not count human turns toward the required 9 answers', () => {
    const d = debate(); d.transcript[8] = {...d.transcript[8],agent:'You'};
    expect(completeUniqueDebates([d])).toEqual([]);
  });
  it('keeps all 9 agent answers', () => expect(completeUniqueDebates([debate()])).toHaveLength(1));
  it('keeps the newest exact duplicate but different casts remain', () => {
    const older = {...debate('old'),created_at:'2026-10-07'};
    const other = {...debate('other'),settings:{...debate().settings,models:{agentA:'x',agentB:'b',agentC:'c'}}};
    expect(completeUniqueDebates([older,debate(),other]).map(d=>d.id)).toEqual(['new','other']);
  });
  it('sanitizes OR injection and wildcard syntax', () => {
    expect(sanitizeQuestionSearch('AI),id.eq.x_%*"')).toBe('AI id eq x');
  });
  it('intersects model, origin and open-weight filters', () => {
    const models = [{model_id:'eu',origin_region:'EU',license_type:'open-weight'},{model_id:'us',origin_region:'US',license_type:'closed'}] as CuratedModel[];
    expect(matchingModelIds(models,{tab:'newest',q:'',origin:'EU',license:'open',model:'eu'})).toEqual(['eu']);
    expect(matchingModelIds(models,{tab:'newest',q:'',origin:'EU',license:'closed',model:''})).toEqual([]);
  });
  it('selects a 50–180 character complete final-round sentence addressing another agent', () => {
    const d = debate(); d.settings = {...d.settings,agentNames:{agentA:'Vivian Sterling',agentB:'Marcel Dufresne',agentC:'Lin Weiyang'}};
    d.transcript[0].message = 'Marcel, this early round sentence must never become the chosen quote.';
    d.transcript[6].message = 'This is a sufficiently long and complete sentence in the final round.';
    d.transcript[8].message = '[Lin Weiyang]: Vivian, you worry about overdeterrence for small firms; I worry about underprotection for small people.';
    expect(showdownQuote(d)).toMatchObject({name:'Lin Weiyang',sentence:'Vivian, you worry about overdeterrence for small firms; I worry about underprotection for small people.'});
  });
});
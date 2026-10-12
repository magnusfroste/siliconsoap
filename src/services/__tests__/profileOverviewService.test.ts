import {describe,it,expect} from 'vitest';
import {splitProfileChats} from '../profileOverviewService';
describe('profile activity groups',()=>{
 it('counts only settings.mode panel as panels',()=>{const rows=[{id:'panel',settings:{mode:'panel'}},{id:'debate',settings:{mode:'spectator'}}];expect(splitProfileChats(rows).panels.map(c=>c.id)).toEqual(['panel']);expect(splitProfileChats(rows).debates.map(c=>c.id)).toEqual(['debate']);});
 it('keeps legacy missing settings in debates',()=>{expect(splitProfileChats([{settings:null},{settings:{}},{settings:'panel'}]).debates).toHaveLength(3);});
});

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEnabledModels } from '@/repositories/curatedModelsRepository';
import { getModelScoreboard } from '@/repositories/scoreboardRepository';
import { scoreRows, type ScoreSort } from '@/services/scoreboardService';
export function useScoreboard(){const [tab,setTab]=useState('roster');const [sort,setSort]=useState<ScoreSort>('answers');const [desc,setDesc]=useState(true);const query=useQuery({queryKey:['model-scoreboard'],queryFn:async()=>{const [rows,models]=await Promise.all([getModelScoreboard(),getEnabledModels()]);return {rows,models};},staleTime:3600000});return {tab,setTab,sort,desc,changeSort:(key:ScoreSort)=>{setDesc(sort===key?!desc:key!=='model');setSort(key);},rows:scoreRows(query.data?.rows??[],query.data?.models??[],tab==='retired',sort,desc),loading:query.isLoading,error:query.isError,retry:query.refetch};}

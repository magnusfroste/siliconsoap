import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEnabledModels } from '@/repositories/curatedModelsRepository';
import { filterRoster } from '@/services/rosterService';
export function useModelRoster() {
 const query = useQuery({queryKey:['enabled-roster'],queryFn:getEnabledModels});
 const [search,setSearch] = useState(''); const [license,setLicense] = useState('all'); const [fast,setFast] = useState(false); const [tier,setTier] = useState('all'); const [expanded,setExpanded] = useState<string[]>([]);
 const models = query.data ?? [];
 return {models,filtered:filterRoster(models,search,license,fast,tier),search,setSearch,license,setLicense,fast,setFast,tier,setTier,expanded,toggleExpanded:(id:string)=>setExpanded(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]),loading:query.isLoading,error:query.isError,retry:query.refetch};
}

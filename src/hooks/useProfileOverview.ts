import { useQuery } from '@tanstack/react-query';
import { getProfileOverview } from '@/repositories/profileOverviewRepository';
import { splitProfileChats } from '@/services/profileOverviewService';
import { connectorRepository } from '@/repositories/connectorRepository';
export function useProfileOverview(userId?:string){
 const query=useQuery({queryKey:['user-profile',userId,'overview'],queryFn:()=>getProfileOverview(userId??''),enabled:!!userId});
 return {...query,...splitProfileChats(query.data?.chats??[]),displayName:query.data?.displayName,hasAccountLink:!!userId&&connectorRepository.read()?.claimedBy===userId};
}

import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedDebates, fetchProfileDebates, fetchLiveDebateRows } from '@/repositories/debateStatsRepository';
import { deriveLiveStats } from '@/services/debateStatsService';
export function useFeaturedDebates() {
 const { data, isLoading } = useQuery({ queryKey: ['featured-real-views'], queryFn: fetchFeaturedDebates });
 return { debates: data ?? [], loading: isLoading };
}
export const useProfileDebates = (userId: string) => useQuery({ queryKey: ['user-public-debates', userId], queryFn: () => fetchProfileDebates(userId), enabled: !!userId });
export function useLiveDebateStats() {
 const { data, isLoading } = useQuery({ queryKey: ['live-real-view-stats'], queryFn: async () => deriveLiveStats(await fetchLiveDebateRows()) });
 return { stats: data ?? { totalDebates: 0, totalViews: 0, totalAgents: 0 }, loading: isLoading };
}

import { useQuery } from '@tanstack/react-query';
import { fetchProfileStats } from '@/repositories/debateStatsRepository';
export { calculateRank, calculateProgress, getNextRank, SILICON_RANKS } from '@/services/profileStatsService';
export type { ProfileStats, SiliconRank } from '@/services/profileStatsService';

export const useProfileStats = (userId: string | undefined) => useQuery({
  queryKey: ['profile-stats', userId],
  queryFn: () => fetchProfileStats(userId),
  enabled: !!userId,
});

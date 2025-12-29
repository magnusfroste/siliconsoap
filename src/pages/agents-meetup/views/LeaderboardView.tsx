import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Eye, MessageSquare, Heart, TrendingUp } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ProfileStats, calculateRank, SILICON_RANKS } from '../hooks/useProfileStats';
import { LeaderboardRowSkeleton } from '@/components/skeletons';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
  userId: string;
  displayName: string | null;
  stats: ProfileStats;
  rank: ReturnType<typeof calculateRank>;
  score: number;
}

// Calculate a score for ranking
const calculateScore = (stats: ProfileStats): number => {
  return (
    stats.publicDebates * 10 +
    stats.totalViews * 1 +
    stats.totalReactions * 5 +
    stats.totalDebates * 2
  );
};

export const LeaderboardView = () => {
  usePageMeta({
    title: 'Silicon Leaderboard - Top Debaters',
    description: 'See the top debaters in the SiliconSoap community ranked by their Silicon Status.',
    canonicalPath: '/leaderboard',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Leaderboard', path: '/leaderboard' },
    ],
  });

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async (): Promise<LeaderboardUser[]> => {
      // Get all users who have public chats
      const { data: publicChats } = await supabase
        .from('agent_chats')
        .select('user_id, is_public, view_count, share_id')
        .eq('is_public', true)
        .not('share_id', 'is', null)
        .not('user_id', 'is', null)
        .is('deleted_at', null);

      if (!publicChats || publicChats.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(publicChats.map(c => c.user_id))] as string[];

      // Fetch all user data in parallel
      const [profilesResult, allChatsResult, creditsResult] = await Promise.all([
        supabase.from('user_profiles').select('user_id, display_name').in('user_id', userIds),
        supabase.from('agent_chats').select('user_id, is_public, view_count, share_id').in('user_id', userIds).is('deleted_at', null),
        supabase.from('user_credits').select('user_id, credits_used').in('user_id', userIds),
      ]);

      const profiles = profilesResult.data || [];
      const allChats = allChatsResult.data || [];
      const credits = creditsResult.data || [];

      // Get reaction counts for all public share_ids
      const shareIds = allChats.filter(c => c.is_public && c.share_id).map(c => c.share_id) as string[];
      let reactionCounts: Record<string, number> = {};
      
      if (shareIds.length > 0) {
        const { data: reactions } = await supabase
          .from('chat_reactions')
          .select('share_id')
          .in('share_id', shareIds);
        
        reactions?.forEach(r => {
          reactionCounts[r.share_id] = (reactionCounts[r.share_id] || 0) + 1;
        });
      }

      // Calculate stats for each user
      const leaderboardUsers: LeaderboardUser[] = userIds.map(userId => {
        const profile = profiles.find(p => p.user_id === userId);
        const userChats = allChats.filter(c => c.user_id === userId);
        const userPublicChats = userChats.filter(c => c.is_public && c.share_id);
        const userCredits = credits.find(c => c.user_id === userId);

        const totalViews = userPublicChats.reduce((sum, c) => sum + (c.view_count || 0), 0);
        const totalReactions = userPublicChats.reduce((sum, c) => {
          return sum + (reactionCounts[c.share_id!] || 0);
        }, 0);

        const stats: ProfileStats = {
          totalDebates: userChats.length,
          publicDebates: userPublicChats.length,
          totalViews,
          totalReactions,
          creditsUsed: userCredits?.credits_used || 0,
        };

        return {
          userId,
          displayName: profile?.display_name || null,
          stats,
          rank: calculateRank(stats),
          score: calculateScore(stats),
        };
      });

      // Sort by score descending
      return leaderboardUsers
        .filter(u => u.stats.publicDebates > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
    },
    staleTime: 60000, // Cache for 1 minute
  });

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-slate-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground w-6 text-center">#{position + 1}</span>;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 0: return 'bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/30';
      case 1: return 'bg-gradient-to-r from-slate-400/10 via-slate-400/5 to-transparent border-slate-400/30';
      case 2: return 'bg-gradient-to-r from-amber-600/10 via-amber-600/5 to-transparent border-amber-600/30';
      default: return 'border-border/50';
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Silicon Leaderboard
            </h1>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            The top debaters in the SiliconSoap community, ranked by their Silicon Status and engagement
          </p>
        </div>

        {/* Rank Legend */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Silicon Ranks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center">
              {SILICON_RANKS.map((rank) => (
                <Badge 
                  key={rank.level} 
                  variant="outline" 
                  className={cn("gap-1.5 py-1.5 px-3", `bg-gradient-to-r ${rank.color} bg-clip-text text-transparent border-current`)}
                >
                  <span>{rank.emoji}</span>
                  <span className={`bg-gradient-to-r ${rank.color} bg-clip-text text-transparent font-medium`}>
                    {rank.title}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Top Debaters</CardTitle>
            <CardDescription>Users ranked by public debates, views, and community engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <LeaderboardRowSkeleton key={i} />
              ))
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rankings yet. Be the first to share a debate!</p>
              </div>
            ) : (
              leaderboard.map((user, index) => (
                <div
                  key={user.userId}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50",
                    getPositionBg(index)
                  )}
                >
                  {/* Position */}
                  <div className="flex items-center justify-center w-8">
                    {getPositionIcon(index)}
                  </div>

                  {/* Rank Badge & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center text-2xl",
                        "bg-gradient-to-br from-muted to-muted/50 border-2",
                        index === 0 && "border-yellow-500/50",
                        index === 1 && "border-slate-400/50",
                        index === 2 && "border-amber-600/50",
                        index > 2 && "border-border"
                      )}
                      title={user.rank.title}
                    >
                      {user.rank.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {user.displayName || 'Anonymous Debater'}
                      </p>
                      <p className={cn(
                        "text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent",
                        user.rank.color
                      )}>
                        {user.rank.title}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1" title="Public Debates">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">{user.stats.publicDebates}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Total Views">
                      <Eye className="h-4 w-4" />
                      <span className="font-medium">{user.stats.totalViews}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Reactions">
                      <Heart className="h-4 w-4" />
                      <span className="font-medium">{user.stats.totalReactions}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <Badge variant="secondary" className="shrink-0">
                    {user.score} pts
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardView;
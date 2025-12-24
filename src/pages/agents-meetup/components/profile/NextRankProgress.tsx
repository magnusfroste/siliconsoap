import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SiliconRank, ProfileStats, getNextRank, SILICON_RANKS } from '../../hooks/useProfileStats';
import { cn } from '@/lib/utils';
import { Target, TrendingUp } from 'lucide-react';

interface NextRankProgressProps {
  currentRank: SiliconRank;
  stats: ProfileStats;
}

export const NextRankProgress = ({ currentRank, stats }: NextRankProgressProps) => {
  const nextRank = getNextRank(currentRank);

  if (!nextRank) {
    return (
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-pink-500/5">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-2">💎</div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
            Silicon Legend
          </h3>
          <p className="text-muted-foreground mt-1">You've reached the highest rank!</p>
        </CardContent>
      </Card>
    );
  }

  const requirements = [
    { 
      label: 'Public Debates', 
      current: stats.publicDebates, 
      required: nextRank.minDebates,
      met: stats.publicDebates >= nextRank.minDebates
    },
    { 
      label: 'Total Views', 
      current: stats.totalViews, 
      required: nextRank.minViews,
      met: stats.totalViews >= nextRank.minViews
    },
    { 
      label: 'Reactions', 
      current: stats.totalReactions, 
      required: nextRank.minReactions,
      met: stats.totalReactions >= nextRank.minReactions
    },
  ].filter(r => r.required > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Next Rank: {nextRank.emoji} {nextRank.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requirements.map((req) => {
          const progress = Math.min(100, (req.current / req.required) * 100);
          
          return (
            <div key={req.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{req.label}</span>
                <span className={cn(
                  "font-medium",
                  req.met ? "text-green-500" : "text-foreground"
                )}>
                  {req.current} / {req.required}
                  {req.met && " ✓"}
                </span>
              </div>
              <Progress 
                value={progress} 
                className={cn("h-2", req.met && "[&>div]:bg-green-500")}
              />
            </div>
          );
        })}
        
        <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Keep creating and sharing debates to level up!</span>
        </div>
      </CardContent>
    </Card>
  );
};

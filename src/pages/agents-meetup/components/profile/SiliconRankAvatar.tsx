import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { SiliconRank, ProfileStats, getNextRank, calculateProgress } from '../../hooks/useProfileStats';
import { cn } from '@/lib/utils';

interface SiliconRankAvatarProps {
  initials: string;
  rank: SiliconRank;
  stats: ProfileStats;
  size?: 'sm' | 'lg';
}

export const SiliconRankAvatar = ({ initials, rank, stats, size = 'lg' }: SiliconRankAvatarProps) => {
  const nextRank = getNextRank(rank);
  const progress = calculateProgress(stats, rank, nextRank);
  const isLarge = size === 'lg';

  const getRingAnimation = () => {
    switch (rank.level) {
      case 2: return 'animate-pulse';
      case 3: return 'animate-[spin_8s_linear_infinite]';
      case 4: return 'animate-[pulse_1.5s_ease-in-out_infinite]';
      case 5: return 'animate-[spin_4s_linear_infinite]';
      default: return '';
    }
  };

  const getGlowEffect = () => {
    if (rank.level < 2) return '';
    if (rank.level === 2) return 'shadow-[0_0_20px_rgba(59,130,246,0.5)]';
    if (rank.level === 3) return 'shadow-[0_0_25px_rgba(168,85,247,0.6)]';
    if (rank.level === 4) return 'shadow-[0_0_30px_rgba(249,115,22,0.7)]';
    return 'shadow-[0_0_40px_rgba(139,92,246,0.8)]';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar with animated ring */}
      <div className="relative">
        {/* Outer animated gradient ring */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r p-1",
            rank.color,
            getRingAnimation(),
            getGlowEffect(),
            isLarge ? "-inset-2" : "-inset-1"
          )}
        />
        
        {/* Inner background to create ring effect */}
        <div 
          className={cn(
            "absolute rounded-full bg-background",
            isLarge ? "inset-0" : "inset-0.5"
          )}
        />
        
        {/* Avatar */}
        <Avatar className={cn(
          "relative z-10 border-2 border-background",
          isLarge ? "h-24 w-24" : "h-12 w-12"
        )}>
          <AvatarFallback className={cn(
            "font-bold bg-gradient-to-br from-muted to-muted/50",
            isLarge ? "text-3xl" : "text-lg"
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Rank emoji badge */}
        <div className={cn(
          "absolute -bottom-1 -right-1 z-20 rounded-full bg-background border-2 border-background flex items-center justify-center",
          isLarge ? "h-10 w-10 text-xl" : "h-6 w-6 text-sm"
        )}>
          {rank.emoji}
        </div>
      </div>

      {/* Rank info */}
      {isLarge && (
        <div className="text-center space-y-2">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-2xl">{rank.emoji}</span>
            <h2 className={cn(
              "text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              rank.color
            )}>
              {rank.title}
            </h2>
          </div>
          
          {nextRank && (
            <div className="space-y-1 w-48">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress to {nextRank.title}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {!nextRank && (
            <p className="text-sm text-muted-foreground">🎉 Max rank achieved!</p>
          )}
        </div>
      )}
    </div>
  );
};

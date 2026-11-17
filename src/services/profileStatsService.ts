export interface ProfileStats {
  totalDebates: number;
  publicDebates: number;
  totalViews: number;
  totalReactions: number;
  creditsUsed: number;
}

export interface SiliconRank {
  level: number;
  title: string;
  emoji: string;
  color: string;
  glowColor: string;
  minDebates: number;
  minViews: number;
  minReactions: number;
}

export const SILICON_RANKS: SiliconRank[] = [
  { level: 1, title: 'Silicon Seedling', emoji: '🌱', color: 'from-slate-400 to-slate-500', glowColor: 'slate-400', minDebates: 0, minViews: 0, minReactions: 0 },
  { level: 2, title: 'Idea Spark', emoji: '💡', color: 'from-blue-400 to-cyan-400', glowColor: 'blue-400', minDebates: 1, minViews: 0, minReactions: 0 },
  { level: 3, title: 'Debate Dynamo', emoji: '⚡', color: 'from-purple-500 to-pink-500', glowColor: 'purple-500', minDebates: 5, minViews: 50, minReactions: 0 },
  { level: 4, title: 'Silicon Flame', emoji: '🔥', color: 'from-orange-500 to-red-500', glowColor: 'orange-500', minDebates: 10, minViews: 100, minReactions: 0 },
  { level: 5, title: 'Silicon Legend', emoji: '💎', color: 'from-violet-500 via-pink-500 to-amber-500', glowColor: 'violet-500', minDebates: 20, minViews: 500, minReactions: 10 },
];

export const calculateRank = (stats: ProfileStats): SiliconRank => {
  let currentRank = SILICON_RANKS[0];
  
  for (const rank of SILICON_RANKS) {
    const meetsDebates = stats.publicDebates >= rank.minDebates;
    const meetsViews = stats.totalViews >= rank.minViews;
    const meetsReactions = stats.totalReactions >= rank.minReactions;
    
    if (rank.level <= 2) {
      // Lower ranks: just need debates
      if (meetsDebates) currentRank = rank;
    } else if (rank.level === 3) {
      // Debate Dynamo: 5+ debates OR 50+ views
      if (meetsDebates || meetsViews) currentRank = rank;
    } else if (rank.level === 4) {
      // Silicon Flame: 10+ debates AND 100+ views
      if (meetsDebates && meetsViews) currentRank = rank;
    } else if (rank.level === 5) {
      // Silicon Legend: 20+ debates AND 500+ views AND 10+ reactions
      if (meetsDebates && meetsViews && meetsReactions) currentRank = rank;
    }
  }
  
  return currentRank;
};

export const getNextRank = (currentRank: SiliconRank): SiliconRank | null => {
  const nextLevel = currentRank.level + 1;
  return SILICON_RANKS.find(r => r.level === nextLevel) || null;
};

export const calculateProgress = (stats: ProfileStats, currentRank: SiliconRank, nextRank: SiliconRank | null): number => {
  if (!nextRank) return 100;
  
  // Calculate progress based on the hardest requirement to meet
  const debateProgress = nextRank.minDebates > 0 
    ? Math.min(100, (stats.publicDebates / nextRank.minDebates) * 100)
    : 100;
  const viewProgress = nextRank.minViews > 0 
    ? Math.min(100, (stats.totalViews / nextRank.minViews) * 100)
    : 100;
  const reactionProgress = nextRank.minReactions > 0 
    ? Math.min(100, (stats.totalReactions / nextRank.minReactions) * 100)
    : 100;
  
  // Return the minimum progress (bottleneck)
  return Math.min(debateProgress, viewProgress, reactionProgress);
};


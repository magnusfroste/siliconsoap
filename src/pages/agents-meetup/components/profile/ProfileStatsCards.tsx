import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Eye, Share2, Heart, Coins } from 'lucide-react';
import { ProfileStats } from '../../hooks/useProfileStats';

interface ProfileStatsCardsProps {
  stats: ProfileStats;
}

export const ProfileStatsCards = ({ stats }: ProfileStatsCardsProps) => {
  const statItems = [
    { 
      label: 'Debates Created', 
      value: stats.totalDebates, 
      icon: MessageSquare, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Shared Publicly', 
      value: stats.publicDebates, 
      icon: Share2, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Total Views', 
      value: stats.totalViews, 
      icon: Eye, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      label: 'Reactions Earned', 
      value: stats.totalReactions, 
      icon: Heart, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    { 
      label: 'Credits Used', 
      value: stats.creditsUsed, 
      icon: Coins, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {statItems.map((item) => (
        <Card key={item.label} className="border-border/50">
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <div className={`p-2 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

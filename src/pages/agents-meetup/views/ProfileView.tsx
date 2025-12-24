import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfileStats, calculateRank } from '../hooks/useProfileStats';
import { 
  SiliconRankAvatar, 
  ProfileStatsCards, 
  ProfileDebatesList, 
  NextRankProgress 
} from '../components/profile';

export const ProfileView = () => {
  const { user, signOut } = useAuth();
  const { data: stats, isLoading: statsLoading } = useProfileStats(user?.id);

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const initials = user.email?.substring(0, 2).toUpperCase() || 'U';
  const defaultStats = { totalDebates: 0, publicDebates: 0, totalViews: 0, totalReactions: 0, creditsUsed: 0 };
  const currentStats = stats || defaultStats;
  const rank = calculateRank(currentStats);

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero Section with Silicon Rank */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar with rank */}
            {statsLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
            ) : (
              <SiliconRankAvatar 
                initials={initials} 
                rank={rank} 
                stats={currentStats}
              />
            )}

            {/* User info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{user.email}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(user.created_at || '').toLocaleDateString()}
              </p>
              <Button variant="destructive" size="sm" onClick={signOut} className="gap-2 mt-4">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <ProfileStatsCards stats={currentStats} />
      )}

      {/* Two column layout for progress and debates */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Rank Progress */}
        {statsLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : (
          <NextRankProgress currentRank={rank} stats={currentStats} />
        )}

        {/* Shared Debates placeholder - will be full width below on mobile */}
        <div className="md:hidden" />
      </div>

      {/* User's Public Debates */}
      <ProfileDebatesList userId={user.id} />
    </div>
  );
};

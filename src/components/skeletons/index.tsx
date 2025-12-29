import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Chat history skeleton for sidebar
export const ChatHistorySkeleton = () => (
  <div className="space-y-2 px-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-2 p-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 flex-1" />
      </div>
    ))}
  </div>
);

// Debate card skeleton for explore/featured
export const DebateCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </CardContent>
  </Card>
);

// Model card skeleton
export const ModelCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

// Leaderboard row skeleton
export const LeaderboardRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 rounded-lg border">
    <Skeleton className="h-6 w-6 rounded" />
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

// Profile stats skeleton
export const ProfileStatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Card>
    ))}
  </div>
);

// Agent card skeleton for new chat
export const AgentCardSkeleton = () => (
  <Card className="p-4 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-5 w-24" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
  </Card>
);

// Quick stats skeleton
export const QuickStatsSkeleton = () => (
  <div className="grid grid-cols-3 gap-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="p-4 text-center">
        <Skeleton className="h-8 w-12 mx-auto mb-2" />
        <Skeleton className="h-4 w-20 mx-auto" />
      </Card>
    ))}
  </div>
);

// Models grid skeleton
export const ModelsGridSkeleton = () => (
  <div className="space-y-8">
    {[...Array(3)].map((_, groupIndex) => (
      <div key={groupIndex} className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <ModelCardSkeleton key={i} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Hall of shame skeleton
export const HallOfShameSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-32" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Featured debates grid skeleton
export const FeaturedDebatesGridSkeleton = () => (
  <div className="grid md:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="p-6 space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-3/4" />
          {i === 0 && <Skeleton className="h-5 w-12 rounded-full" />}
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </Card>
    ))}
  </div>
);

// Credits badge skeleton
export const CreditsBadgeSkeleton = () => (
  <Skeleton className="h-5 w-8 rounded-full" />
);

// Credits display skeleton (full)
export const CreditsDisplaySkeleton = () => (
  <div className="flex items-center gap-2 text-sm">
    <Skeleton className="h-4 w-4 rounded" />
    <Skeleton className="h-4 w-12" />
    <Skeleton className="h-5 w-8 rounded-full" />
  </div>
);

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAgentProfiles } from '@/hooks/useAgentProfiles';

export const AgentProfilesView = () => {
  const { profiles, isLoading } = useAgentProfiles();

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Agent Profiles</h1>
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Profiles</h1>
        <p className="text-muted-foreground">Browse available agent personas for your conversations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile) => (
          <Card key={profile.id} className="hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {profile.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      System
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{profile.description}</p>
              
              {profile.instructions && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">Full Instructions</p>
                  <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-line">
                    {profile.instructions}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Coming Soon: Custom Profiles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create your own agent personas and purchase premium profiles from the marketplace
          </p>
        </CardHeader>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/editorial/PageHeader';
import { useAgentProfiles } from '@/hooks/useAgentProfiles';

export const AgentProfilesView = () => {
  const { profiles, isLoading } = useAgentProfiles();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-12 space-y-6">
        <PageHeader eyebrow="The cast" title="Roles" lead="Roles (personas) shape how an agent argues — its perspective, priorities and tone." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile) => (
          <Card key={profile.id} className="rounded-lg shadow-none hover:border-primary transition-colors min-w-0">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {profile.icon}
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl">{profile.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      System
                    </Badge>
                  </div>
                </details>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{profile.description}</p>
              
              {profile.instructions && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">Full Instructions</p>
                  <div className="py-3 text-sm text-muted-foreground whitespace-pre-line break-words">
                    {profile.instructions}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="font-display text-xl">Coming Soon: Custom Profiles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create your own agent personas and purchase premium profiles from the marketplace
          </p>
        </CardHeader>
      </Card>
    </div>
  );
};

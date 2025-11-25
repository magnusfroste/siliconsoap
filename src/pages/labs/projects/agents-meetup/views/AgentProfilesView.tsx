import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { profiles } from '../constants';

export const AgentProfilesView = () => {
  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agent Profiles</h1>
        <p className="text-muted-foreground">Browse available agent personas for your conversations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Free
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{profile.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Coming Soon: Custom Profiles</CardTitle>
          <CardDescription>
            Create your own agent personas and purchase premium profiles from the marketplace
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

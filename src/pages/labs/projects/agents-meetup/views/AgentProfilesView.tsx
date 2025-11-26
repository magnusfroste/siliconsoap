import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAgentProfiles } from '@/hooks/useAgentProfiles';

export const AgentProfilesView = () => {
  const { profiles, isLoading } = useAgentProfiles();
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());

  const toggleExpanded = (profileId: string) => {
    setExpandedProfiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      return newSet;
    });
  };

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
        {profiles.map((profile) => {
          const isExpanded = expandedProfiles.has(profile.id);
          return (
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
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(profile.id)}>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      Full Instructions
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-line">
                        {profile.instructions}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          );
        })}
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

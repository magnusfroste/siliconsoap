import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface PublicDebate {
  id: string;
  title: string;
  prompt: string;
  share_id: string;
  view_count: number;
  created_at: string;
  reaction_count: number;
}

interface ProfileDebatesListProps {
  userId: string;
}

export const ProfileDebatesList = ({ userId }: ProfileDebatesListProps) => {
  const { data: debates, isLoading } = useQuery({
    queryKey: ['user-public-debates', userId],
    queryFn: async (): Promise<PublicDebate[]> => {
      // Get public chats
      const { data: chats, error } = await supabase
        .from('agent_chats')
        .select('id, title, prompt, share_id, view_count, created_at')
        .eq('user_id', userId)
        .eq('is_public', true)
        .not('share_id', 'is', null)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error || !chats) return [];

      // Get reaction counts
      const shareIds = chats.map(c => c.share_id).filter(Boolean) as string[];
      
      if (shareIds.length === 0) {
        return chats.map(c => ({ ...c, reaction_count: 0 }));
      }

      const { data: reactions } = await supabase
        .from('chat_reactions')
        .select('share_id')
        .in('share_id', shareIds);

      // Count reactions per share_id
      const reactionCounts: Record<string, number> = {};
      reactions?.forEach(r => {
        reactionCounts[r.share_id] = (reactionCounts[r.share_id] || 0) + 1;
      });

      return chats.map(c => ({
        ...c,
        share_id: c.share_id!,
        reaction_count: reactionCounts[c.share_id!] || 0
      }));
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Shared Battles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!debates || debates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Shared Battles</CardTitle>
          <CardDescription>Share your debates to see them here!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No shared debates yet</p>
            <p className="text-sm mt-1">Start a conversation and share it with the world! 🌍</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏆 Your Shared Battles
          <Badge variant="secondary">{debates.length}</Badge>
        </CardTitle>
        <CardDescription>Your public debates visible to everyone</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {debates.map((debate) => (
          <Link
            key={debate.id}
            to={`/shared/${debate.share_id}`}
            className="block"
          >
            <div className="group p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                    {debate.title}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {debate.prompt}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {debate.view_count} views
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {debate.reaction_count} reactions
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

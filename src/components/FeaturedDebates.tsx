import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageSquare, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface FeaturedDebate {
  id: string;
  title: string;
  prompt: string;
  share_id: string;
  view_count: number;
  created_at: string;
  message_count: number;
  agent_count: number;
}

export const FeaturedDebates = () => {
  const navigate = useNavigate();
  const [debates, setDebates] = useState<FeaturedDebate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingDebates = async () => {
      try {
        const { data: chats, error } = await supabase
          .from('agent_chats')
          .select('id, title, prompt, share_id, view_count, created_at')
          .eq('is_public', true)
          .not('share_id', 'is', null)
          .is('deleted_at', null)
          .order('view_count', { ascending: false })
          .limit(3);

        if (error) throw error;

        if (chats && chats.length > 0) {
          const debatesWithCounts = await Promise.all(
            chats.map(async (chat) => {
              const { count: messageCount } = await supabase
                .from('agent_chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('chat_id', chat.id);

              const { data: agents } = await supabase
                .from('agent_chat_messages')
                .select('agent')
                .eq('chat_id', chat.id);

              const uniqueAgents = new Set(agents?.map(a => a.agent) || []);

              return {
                ...chat,
                message_count: messageCount || 0,
                agent_count: uniqueAgents.size,
              };
            })
          );

          setDebates(debatesWithCounts);
        }
      } catch (error) {
        console.error('Error fetching featured debates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingDebates();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-semibold">Trending Debates</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (debates.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-semibold">Trending Debates</h3>
          </div>
          <Link to="/explore">
            <Button variant="ghost" size="sm" className="group">
              View all
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {debates.map((debate, index) => (
            <Card 
              key={debate.id}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/shared/${debate.share_id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {debate.title}
                </h4>
                {index === 0 && (
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    🔥 Hot
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {debate.prompt}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{debate.view_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{debate.message_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{debate.agent_count} agents</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

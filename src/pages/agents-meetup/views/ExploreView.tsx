import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Clock, TrendingUp, MessageSquare, Sparkles, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatSettings } from '@/models/chat';
import { Json } from '@/integrations/supabase/types';

interface PublicDebate {
  id: string;
  title: string;
  prompt: string;
  share_id: string;
  view_count: number;
  created_at: string;
  settings: Json | null;
  message_count?: number;
}

export default function ExploreView() {
  const navigate = useNavigate();
  const [debates, setDebates] = useState<PublicDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    fetchPublicDebates();
  }, [activeTab]);

  const fetchPublicDebates = async () => {
    setLoading(true);
    
    let query = supabase
      .from('agent_chats')
      .select('id, title, prompt, share_id, view_count, created_at, settings')
      .eq('is_public', true)
      .not('share_id', 'is', null)
      .is('deleted_at', null);

    if (activeTab === 'trending') {
      query = query.order('view_count', { ascending: false }).limit(20);
    } else {
      query = query.order('created_at', { ascending: false }).limit(20);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching public debates:', error);
      setLoading(false);
      return;
    }

    // Get message counts for each debate
    if (data && data.length > 0) {
      const debatesWithCounts = await Promise.all(
        data.map(async (debate) => {
          const { count } = await supabase
            .from('agent_chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', debate.id);
          
          return {
            ...debate,
            message_count: count || 0
          };
        })
      );
      setDebates(debatesWithCounts);
    } else {
      setDebates([]);
    }
    
    setLoading(false);
  };

  const getAgentCount = (settings: Json | null): number => {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return 2;
    const s = settings as { numberOfAgents?: number };
    return s.numberOfAgents || 2;
  };

  const handleDebateClick = (shareId: string) => {
    navigate(`/shared/${shareId}`);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Public Debates</h1>
          <p className="text-muted-foreground">
            Discover interesting AI debates shared by the community
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="recent" className="gap-2">
              <Clock className="h-4 w-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6">
            <DebateGrid 
              debates={debates} 
              loading={loading} 
              onDebateClick={handleDebateClick}
              getAgentCount={getAgentCount}
            />
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <DebateGrid 
              debates={debates} 
              loading={loading} 
              onDebateClick={handleDebateClick}
              getAgentCount={getAgentCount}
            />
          </TabsContent>
        </Tabs>

        {/* Empty state */}
        {!loading && debates.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No public debates yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share a debate with the community!
            </p>
            <Button onClick={() => navigate('/')}>
              Start a Debate
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface DebateGridProps {
  debates: PublicDebate[];
  loading: boolean;
  onDebateClick: (shareId: string) => void;
  getAgentCount: (settings: Json | null) => number;
}

function DebateGrid({ debates, loading, onDebateClick, getAgentCount }: DebateGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-5 bg-muted rounded w-3/4 mb-3" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {debates.map((debate) => (
        <Card 
          key={debate.id}
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => onDebateClick(debate.share_id)}
        >
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-1">{debate.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {debate.prompt}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {getAgentCount(debate.settings)} agents
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <MessageSquare className="h-3 w-3" />
                {debate.message_count} messages
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {debate.view_count} views
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

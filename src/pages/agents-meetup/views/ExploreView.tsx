import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Clock, TrendingUp, MessageSquare, Sparkles, Users, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatSettings } from '@/models/chat';
import { Json } from '@/integrations/supabase/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ProfileStats, calculateRank, SiliconRank } from '../hooks/useProfileStats';
import { HallOfShame } from '../components/HallOfShame';
import { DebateCardSkeleton } from '@/components/skeletons';
import { trackExploreView } from '@/utils/analytics';

interface UserRankInfo {
  displayName: string | null;
  rank: SiliconRank;
}

interface PublicDebate {
  id: string;
  title: string;
  prompt: string;
  share_id: string;
  view_count: number;
  created_at: string;
  settings: Json | null;
  user_id: string | null;
  message_count?: number;
  sharer_name?: string | null;
  sharer_rank?: SiliconRank | null;
}

export default function ExploreView() {
  const navigate = useNavigate();
  const [debates, setDebates] = useState<PublicDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('recent');

  usePageMeta({
    title: 'Explore Trending AI Debates',
    description: 'Discover popular AI debates shared by the community. Watch AI agents debate topics from ethics to technology with dramatic flair.',
    canonicalPath: '/explore',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Explore', path: '/explore' },
    ],
  });

  useEffect(() => {
    fetchPublicDebates();
  }, [activeTab]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPublicDebates(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchPublicDebates = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    let query = supabase
      .from('agent_chats')
      .select('id, title, prompt, share_id, view_count, created_at, settings, user_id')
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

    // Get message counts, sharer names, and ranks for each debate
    if (data && data.length > 0) {
      // Get unique user IDs to fetch their profiles and stats
      const userIds = [...new Set(data.filter(d => d.user_id).map(d => d.user_id))] as string[];
      
      // Fetch user profiles and calculate ranks
      let userRankInfo: Record<string, UserRankInfo> = {};
      if (userIds.length > 0) {
        // Fetch profiles
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);
        
        // Fetch user chats for stats
        const { data: userChats } = await supabase
          .from('agent_chats')
          .select('user_id, is_public, view_count, share_id')
          .in('user_id', userIds)
          .is('deleted_at', null);

        // Fetch user credits
        const { data: userCredits } = await supabase
          .from('user_credits')
          .select('user_id, credits_used')
          .in('user_id', userIds);

        // Get all share_ids for reaction counts
        const shareIds = userChats?.filter(c => c.is_public && c.share_id).map(c => c.share_id) || [];
        let reactionCounts: Record<string, number> = {};
        if (shareIds.length > 0) {
          const { data: reactions } = await supabase
            .from('chat_reactions')
            .select('share_id')
            .in('share_id', shareIds as string[]);
          
          reactions?.forEach(r => {
            reactionCounts[r.share_id] = (reactionCounts[r.share_id] || 0) + 1;
          });
        }

        // Calculate stats and ranks for each user
        for (const userId of userIds) {
          const userProfile = profiles?.find(p => p.user_id === userId);
          const chats = userChats?.filter(c => c.user_id === userId) || [];
          const publicChats = chats.filter(c => c.is_public && c.share_id);
          const credits = userCredits?.find(c => c.user_id === userId);
          
          const totalViews = publicChats.reduce((sum, c) => sum + (c.view_count || 0), 0);
          const totalReactions = publicChats.reduce((sum, c) => {
            return sum + (reactionCounts[c.share_id!] || 0);
          }, 0);

          const stats: ProfileStats = {
            totalDebates: chats.length,
            publicDebates: publicChats.length,
            totalViews,
            totalReactions,
            creditsUsed: credits?.credits_used || 0
          };

          userRankInfo[userId] = {
            displayName: userProfile?.display_name || null,
            rank: calculateRank(stats)
          };
        }
      }

      const debatesWithCounts = await Promise.all(
        data.map(async (debate) => {
          const { count } = await supabase
            .from('agent_chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', debate.id);
          
          const userInfo = debate.user_id ? userRankInfo[debate.user_id] : null;
          
          return {
            ...debate,
            message_count: count || 0,
            sharer_name: userInfo?.displayName || null,
            sharer_rank: userInfo?.rank || null
          };
        })
      );
      setDebates(debatesWithCounts);
    } else {
      setDebates([]);
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    fetchPublicDebates(true);
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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Explore Public Debates</h1>
            <p className="text-muted-foreground">
              Discover interesting AI debates shared by the community
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="gap-2 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Hall of Shame */}
        <div className="mb-8">
          <HallOfShame />
        </div>

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); trackExploreView(val); }} className="mb-6">
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

        {/* JSON-LD ItemList structured data for debates */}
        {!loading && debates.length > 0 && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'name': 'SiliconSoap AI Debates',
            'description': 'Popular AI debates shared by the SiliconSoap community',
            'numberOfItems': debates.length,
            'itemListElement': debates.slice(0, 10).map((debate, i) => ({
              '@type': 'ListItem',
              'position': i + 1,
              'item': {
                '@type': 'DiscussionForumPosting',
                'headline': debate.title,
                'text': debate.prompt,
                'url': `https://siliconsoap.com/shared/${debate.share_id}`,
                'datePublished': debate.created_at,
                'interactionStatistic': [
                  { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/ViewAction', 'userInteractionCount': debate.view_count },
                  { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/CommentAction', 'userInteractionCount': debate.message_count || 0 }
                ],
                'author': debate.sharer_name ? { '@type': 'Person', 'name': debate.sharer_name } : { '@type': 'Organization', 'name': 'SiliconSoap' }
              }
            }))
          })}} />
        )}

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
          <DebateCardSkeleton key={i} />
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
              <div className="flex items-center gap-4">
                {(debate.sharer_name || debate.sharer_rank) && (
                  <span className="text-foreground/70 flex items-center gap-1">
                    {debate.sharer_rank && (
                      <span title={debate.sharer_rank.title}>{debate.sharer_rank.emoji}</span>
                    )}
                    {debate.sharer_name ? (
                      <>Shared by <span className="font-medium">{debate.sharer_name}</span></>
                    ) : (
                      <span className="font-medium">{debate.sharer_rank?.title}</span>
                    )}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {debate.view_count} views
                </div>
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

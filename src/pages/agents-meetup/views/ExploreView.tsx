import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Clock, TrendingUp, MessageSquare, Sparkles, Users, RefreshCw, Flame, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
  reaction_count?: number;
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

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPublicDebates(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchPublicDebates = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

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

    if (data && data.length > 0) {
      const userIds = [...new Set(data.filter(d => d.user_id).map(d => d.user_id))] as string[];
      const allShareIds = data.map(d => d.share_id).filter(Boolean) as string[];

      // Per-debate reaction counts
      const debateReactions: Record<string, number> = {};
      if (allShareIds.length > 0) {
        const { data: reactions } = await supabase
          .from('chat_reactions')
          .select('share_id')
          .in('share_id', allShareIds);
        reactions?.forEach(r => {
          debateReactions[r.share_id] = (debateReactions[r.share_id] || 0) + 1;
        });
      }

      const userRankInfo: Record<string, UserRankInfo> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);

        const { data: userChats } = await supabase
          .from('agent_chats')
          .select('user_id, is_public, view_count, share_id')
          .in('user_id', userIds)
          .is('deleted_at', null);

        const { data: userCredits } = await supabase
          .from('user_credits')
          .select('user_id, credits_used')
          .in('user_id', userIds);

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

        for (const userId of userIds) {
          const userProfile = profiles?.find(p => p.user_id === userId);
          const chats = userChats?.filter(c => c.user_id === userId) || [];
          const publicChats = chats.filter(c => c.is_public && c.share_id);
          const credits = userCredits?.find(c => c.user_id === userId);
          const totalViews = publicChats.reduce((sum, c) => sum + (c.view_count || 0), 0);
          const totalReactions = publicChats.reduce((sum, c) => sum + (reactionCounts[c.share_id!] || 0), 0);
          const stats: ProfileStats = {
            totalDebates: chats.length,
            publicDebates: publicChats.length,
            totalViews,
            totalReactions,
            creditsUsed: credits?.credits_used || 0,
          };
          userRankInfo[userId] = {
            displayName: userProfile?.display_name || null,
            rank: calculateRank(stats),
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
            reaction_count: debateReactions[debate.share_id] || 0,
            sharer_name: userInfo?.displayName || null,
            sharer_rank: userInfo?.rank || null,
          };
        })
      );
      setDebates(debatesWithCounts.filter(d => (d.message_count ?? 0) > 0));
    } else {
      setDebates([]);
    }

    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => fetchPublicDebates(true);

  const getAgentCount = (settings: Json | null): number => {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return 2;
    const s = settings as { numberOfAgents?: number };
    return s.numberOfAgents || 2;
  };

  const getPersonas = (settings: Json | null): string[] => {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return [];
    const s = settings as { personas?: Record<string, string>; numberOfAgents?: number };
    const count = s.numberOfAgents || 2;
    const keys = ['agentA', 'agentB', 'agentC'].slice(0, count);
    return keys.map(k => s.personas?.[k] || '').filter(Boolean);
  };

  const handleDebateClick = (shareId: string) => navigate(`/shared/${shareId}`);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
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
              getPersonas={getPersonas}
            />
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <DebateGrid
              debates={debates}
              loading={loading}
              onDebateClick={handleDebateClick}
              getAgentCount={getAgentCount}
              getPersonas={getPersonas}
            />
          </TabsContent>
        </Tabs>

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

        {!loading && debates.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No public debates yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share a debate with the community!
            </p>
            <Button onClick={() => navigate('/')}>Start a Debate</Button>
          </div>
        )}

        <div className="mt-12">
          <HallOfShame />
        </div>
      </div>
    </div>
  );
}

interface DebateGridProps {
  debates: PublicDebate[];
  loading: boolean;
  onDebateClick: (shareId: string) => void;
  getAgentCount: (settings: Json | null) => number;
  getPersonas: (settings: Json | null) => string[];
}

// Deterministic gradient pair from string id
const GRADIENTS: Array<[string, string]> = [
  ['hsl(280 85% 65%)', 'hsl(190 90% 60%)'], // purple -> cyan
  ['hsl(330 85% 65%)', 'hsl(280 85% 65%)'], // pink -> purple
  ['hsl(190 90% 60%)', 'hsl(160 75% 55%)'], // cyan -> mint
  ['hsl(20 90% 62%)', 'hsl(330 85% 65%)'], // coral -> pink
  ['hsl(250 85% 68%)', 'hsl(190 90% 60%)'], // indigo -> cyan
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function gradientFor(id: string): [string, string] {
  return GRADIENTS[hashId(id) % GRADIENTS.length];
}

function avatarGradient(seed: string, offset = 0): string {
  const palette = ['280 85% 65%', '190 90% 60%', '330 85% 65%', '160 75% 55%', '20 90% 62%', '250 85% 68%'];
  const i = (hashId(seed) + offset) % palette.length;
  const j = (i + 2) % palette.length;
  return `linear-gradient(135deg, hsl(${palette[i]}), hsl(${palette[j]}))`;
}

function personaInitial(persona: string, idx: number): string {
  if (!persona) return String.fromCharCode(65 + idx);
  const clean = persona.replace(/[_-]/g, ' ').trim();
  return clean.charAt(0).toUpperCase() || String.fromCharCode(65 + idx);
}

function DebateGrid({ debates, loading, onDebateClick, getAgentCount, getPersonas }: DebateGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => <DebateCardSkeleton key={i} />)}
      </div>
    );
  }

  const now = Date.now();
  const HOUR = 60 * 60 * 1000;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {debates.map((debate) => {
        const agentCount = getAgentCount(debate.settings);
        const personas = getPersonas(debate.settings);
        const ageMs = now - new Date(debate.created_at).getTime();
        const isNew = ageMs < HOUR;
        const isHot = debate.view_count >= 25 || (debate.reaction_count ?? 0) >= 5;
        const [g1, g2] = gradientFor(debate.id);

        return (
          <Card
            key={debate.id}
            onClick={() => onDebateClick(debate.share_id)}
            className="group relative cursor-pointer overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
          >
            {/* Gradient top accent */}
            <div
              className="absolute inset-x-0 top-0 h-[3px] opacity-70 transition-opacity group-hover:opacity-100"
              style={{ background: `linear-gradient(90deg, ${g1}, ${g2})` }}
              aria-hidden
            />
            {/* Soft hover glow */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
              style={{ background: `radial-gradient(circle, ${g1}, transparent 70%)` }}
              aria-hidden
            />

            <CardContent className="relative p-5">
              {/* Avatar stack + status badges */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex -space-x-2">
                  {Array.from({ length: agentCount }).map((_, i) => (
                    <div
                      key={i}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card text-xs font-bold text-white shadow-md ring-0 transition-transform group-hover:translate-y-0"
                      style={{
                        background: avatarGradient(debate.id, i),
                        zIndex: agentCount - i,
                      }}
                      title={personas[i] || `Agent ${String.fromCharCode(65 + i)}`}
                    >
                      {personaInitial(personas[i] || '', i)}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {isHot && (
                    <Badge className="gap-1 border-0 bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm">
                      <Flame className="h-3 w-3" />
                      Hot
                    </Badge>
                  )}
                  {isNew && !isHot && (
                    <Badge className="gap-1 border-0 bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      New
                    </Badge>
                  )}
                  {debate.sharer_rank && (
                    <span
                      className="text-base leading-none"
                      title={debate.sharer_rank.title}
                    >
                      {debate.sharer_rank.emoji}
                    </span>
                  )}
                </div>
              </div>

              {/* Title + prompt */}
              <h3 className="mb-1.5 text-lg font-semibold leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                {debate.title}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground/90 line-clamp-2">
                {debate.prompt}
              </p>

              {/* Meta row */}
              <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" title="Agents">
                    <Users className="h-3.5 w-3.5" />
                    {agentCount}
                  </span>
                  <span className="flex items-center gap-1" title="Messages">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {debate.message_count}
                  </span>
                  <span className="flex items-center gap-1" title="Views">
                    <Eye className="h-3.5 w-3.5" />
                    {debate.view_count}
                  </span>
                  {(debate.reaction_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-pink-500" title="Reactions">
                      <Heart className="h-3.5 w-3.5 fill-current" />
                      {debate.reaction_count}
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Sharer line (subtle) */}
              {debate.sharer_name && (
                <div className="mt-2 text-[11px] text-muted-foreground/70">
                  Shared by <span className="font-medium text-foreground/80">{debate.sharer_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

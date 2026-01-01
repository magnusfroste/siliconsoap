import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, Users, Calendar as CalendarIcon, TrendingUp, Download, RefreshCw, Cpu, Coins, 
  Link2, Eye, MessageSquare, Flame, Briefcase, Coffee, UsersRound, Filter, X
} from 'lucide-react';
import { analyticsService, type ChatAnalytics, type AnalyticsSummary, type ModelUsageStats } from '@/services';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

type SharedFilter = 'all' | 'shared' | 'not-shared';
type ModeFilter = 'all' | 'spectator' | 'jump-in';
type ToneFilter = 'all' | 'heated' | 'formal' | 'casual' | 'collaborative';

export const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState<ChatAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [modelStats, setModelStats] = useState<ModelUsageStats[]>([]);
  const [tokenUsageMap, setTokenUsageMap] = useState<Record<string, number>>({});
  const [actualMessageCounts, setActualMessageCounts] = useState<Record<string, number>>({});
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [userDisplayNames, setUserDisplayNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [sharedFilter, setSharedFilter] = useState<SharedFilter>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [toneFilter, setToneFilter] = useState<ToneFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, summaryData, modelStatsData] = await Promise.all([
        analyticsService.getAll(200),
        analyticsService.getSummary(),
        analyticsService.getModelUsageStats()
      ]);
      setAnalytics(analyticsData);
      setSummary(summaryData);
      setModelStats(modelStatsData);

      // Fetch token usage for chats that have chat_id
      const chatIds = analyticsData
        .filter(a => a.chat_id)
        .map(a => a.chat_id as string);
      if (chatIds.length > 0) {
        const tokenData = await analyticsService.getTokenUsagePerChat(chatIds);
        setTokenUsageMap(tokenData);

        // Fetch actual message counts from agent_chat_messages
        const { data: messageCounts } = await supabase
          .from('agent_chat_messages')
          .select('chat_id')
          .in('chat_id', chatIds);
        
        if (messageCounts) {
          const counts: Record<string, number> = {};
          messageCounts.forEach((msg) => {
            counts[msg.chat_id] = (counts[msg.chat_id] || 0) + 1;
          });
          setActualMessageCounts(counts);
        }
      }

      // Fetch user emails and display names for non-guest chats
      const userIds = [...new Set(analyticsData
        .filter(a => a.user_id && !a.is_guest)
        .map(a => a.user_id as string))];
      if (userIds.length > 0) {
        const [emailData, nameData] = await Promise.all([
          analyticsService.getUserEmails(userIds),
          analyticsService.getUserDisplayNames(userIds)
        ]);
        setUserEmails(emailData);
        setUserDisplayNames(nameData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered analytics
  const filteredAnalytics = useMemo(() => {
    return analytics.filter(a => {
      // Shared filter
      if (sharedFilter === 'shared' && !(a.is_public && a.share_id)) return false;
      if (sharedFilter === 'not-shared' && (a.is_public && a.share_id)) return false;
      
      // Mode filter
      if (modeFilter === 'spectator' && a.settings?.participationMode !== 'spectator') return false;
      if (modeFilter === 'jump-in' && a.settings?.participationMode !== 'jump-in') return false;
      
      // Tone filter
      if (toneFilter !== 'all' && a.settings?.conversationTone !== toneFilter) return false;
      
      // Date range filter
      if (dateRange?.from) {
        const created = new Date(a.created_at);
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        if (!isWithinInterval(created, { start: from, end: to })) return false;
      }
      
      return true;
    });
  }, [analytics, sharedFilter, modeFilter, toneFilter, dateRange]);

  // Computed stats for settings breakdown (uses all analytics, not filtered)
  const settingsStats = useMemo(() => {
    const withSettings = analytics.filter(a => a.settings);
    const shared = analytics.filter(a => a.is_public && a.share_id);
    const spectator = withSettings.filter(a => a.settings?.participationMode === 'spectator');
    const heated = withSettings.filter(a => a.settings?.conversationTone === 'heated');
    const formal = withSettings.filter(a => a.settings?.conversationTone === 'formal');
    const casual = withSettings.filter(a => a.settings?.conversationTone === 'casual');
    const collaborative = withSettings.filter(a => a.settings?.conversationTone === 'collaborative');
    
    const tones = { heated: heated.length, formal: formal.length, casual: casual.length, collaborative: collaborative.length };
    const popularTone = Object.entries(tones).sort((a, b) => b[1] - a[1])[0];

    return {
      sharedCount: shared.length,
      sharedRate: analytics.length > 0 ? Math.round((shared.length / analytics.length) * 100) : 0,
      spectatorCount: spectator.length,
      jumpInCount: withSettings.length - spectator.length,
      spectatorRate: withSettings.length > 0 ? Math.round((spectator.length / withSettings.length) * 100) : 0,
      popularTone: popularTone?.[0] || 'N/A',
      popularToneCount: popularTone?.[1] || 0,
      tones
    };
  }, [analytics]);

  const hasActiveFilters = sharedFilter !== 'all' || modeFilter !== 'all' || toneFilter !== 'all' || dateRange !== undefined;

  const clearFilters = () => {
    setSharedFilter('all');
    setModeFilter('all');
    setToneFilter('all');
    setDateRange(undefined);
  };

  const exportCsv = () => {
    const headers = ['Date', 'User Type', 'Prompt', 'Scenario', 'Models', 'Agents', 'Rounds', 'Messages', 'Duration (s)', 'Shared', 'Mode', 'Tone', 'Turn Order'];
    const rows = analytics.map(a => {
      // Use actual message count if available, fall back to total_messages
      const actualCount = a.chat_id ? actualMessageCounts[a.chat_id] : null;
      const messageCount = actualCount ?? a.total_messages;
      return [
        format(new Date(a.created_at), 'yyyy-MM-dd HH:mm'),
        a.is_guest ? 'Guest' : 'User',
        `"${(a.prompt_preview || '').replace(/"/g, '""')}"`,
        a.scenario_id || '',
        (a.models_used || []).join('; '),
        a.num_agents,
        a.num_rounds,
        messageCount,
        Math.round((a.generation_duration_ms || 0) / 1000),
        a.is_public && a.share_id ? 'Yes' : 'No',
        a.settings?.participationMode || '',
        a.settings?.conversationTone || '',
        a.settings?.turnOrder || ''
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siliconsoap-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalTokensUsed = modelStats.reduce((sum, m) => sum + m.total_tokens, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{summary?.totalChats || 0}</p>
                <p className="text-sm text-muted-foreground">Total Chats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{summary?.chatsToday || 0}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{summary?.uniqueUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Unique Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{summary?.guestPercentage || 0}%</p>
                <p className="text-sm text-muted-foreground">Guest Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards - Row 2: Settings Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{settingsStats.sharedRate}%</p>
                <p className="text-sm text-muted-foreground">Shared Rate ({settingsStats.sharedCount})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{settingsStats.spectatorRate}%</p>
                <p className="text-sm text-muted-foreground">Spectator Mode</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{settingsStats.jumpInCount}</p>
                <p className="text-sm text-muted-foreground">Jump-in Debates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {settingsStats.popularTone === 'heated' && <Flame className="h-5 w-5 text-orange-500" />}
              {settingsStats.popularTone === 'formal' && <Briefcase className="h-5 w-5 text-blue-500" />}
              {settingsStats.popularTone === 'casual' && <Coffee className="h-5 w-5 text-amber-500" />}
              {settingsStats.popularTone === 'collaborative' && <UsersRound className="h-5 w-5 text-green-500" />}
              {settingsStats.popularTone === 'N/A' && <BarChart3 className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="text-2xl font-bold capitalize">{settingsStats.popularTone}</p>
                <p className="text-sm text-muted-foreground">Popular Tone ({settingsStats.popularToneCount})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Usage Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            <div>
              <CardTitle>Model Usage Breakdown</CardTitle>
              <CardDescription>
                Token consumption by model - helps inform pricing adjustments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {modelStats.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No model usage data yet. Token usage will appear here as debates are generated.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{formatTokens(totalTokensUsed)}</div>
                  <div className="text-xs text-muted-foreground">Total Tokens</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{modelStats.length}</div>
                  <div className="text-xs text-muted-foreground">Models Used</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{modelStats.reduce((sum, m) => sum + m.call_count, 0)}</div>
                  <div className="text-xs text-muted-foreground">API Calls</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Coins className="h-4 w-4" />
                    {(totalTokensUsed / 100000).toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Est. Credits Used</div>
                </div>
              </div>

              {/* Model breakdown table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Est. Credits</TableHead>
                    <TableHead className="w-[200px]">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelStats.map((stat) => {
                    const percentage = totalTokensUsed > 0 ? (stat.total_tokens / totalTokensUsed) * 100 : 0;
                    const modelName = stat.model_id.split('/').pop() || stat.model_id;
                    const provider = stat.model_id.split('/')[0] || 'unknown';
                    const estCredits = stat.total_tokens / 100000;
                    
                    return (
                      <TableRow key={stat.model_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{modelName}</div>
                            <div className="text-xs text-muted-foreground">{provider}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">{stat.call_count}</TableCell>
                        <TableCell className="text-right font-mono">{formatTokens(stat.total_tokens)}</TableCell>
                        <TableCell className="text-right font-mono">{estCredits.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="h-2" />
                            <span className="text-xs text-muted-foreground w-12">{percentage.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Log Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Chat Log</CardTitle>
              <CardDescription>
                {hasActiveFilters 
                  ? `Showing ${filteredAnalytics.length} of ${analytics.length} conversations`
                  : 'All conversations created on the platform'
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters:</span>
            </div>

            <Select value={sharedFilter} onValueChange={(v) => setSharedFilter(v as SharedFilter)}>
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Shared" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="not-shared">Not Shared</SelectItem>
              </SelectContent>
            </Select>

            <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as ModeFilter)}>
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="spectator">Spectator</SelectItem>
                <SelectItem value="jump-in">Jump-in</SelectItem>
              </SelectContent>
            </Select>

            <Select value={toneFilter} onValueChange={(v) => setToneFilter(v as ToneFilter)}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tones</SelectItem>
                <SelectItem value="heated">Heated</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="collaborative">Collaborative</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 bg-popover border shadow-xl z-[100]" 
                align="start" 
                sideOffset={8}
                style={{ position: 'relative' }}
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  className="pointer-events-auto p-3"
                />
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="max-w-[250px]">Prompt</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead className="text-center">Shared</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Tone</TableHead>
                  <TableHead>Models</TableHead>
                  <TableHead className="text-center">Agents</TableHead>
                  <TableHead className="text-center">Rounds</TableHead>
                  <TableHead className="text-center">Msgs</TableHead>
                  <TableHead className="text-center">Tokens</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalytics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center text-muted-foreground py-8">
                      {hasActiveFilters 
                        ? 'No conversations match the current filters.'
                        : 'No chat analytics yet. Chats will appear here as users create them.'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnalytics.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(a.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>
                        {a.is_guest ? (
                          <Badge variant="secondary">Guest</Badge>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium truncate max-w-[150px]">
                              {a.user_id && userDisplayNames[a.user_id] 
                                ? userDisplayNames[a.user_id] 
                                : a.user_id && userEmails[a.user_id] 
                                  ? userEmails[a.user_id] 
                                  : 'User'}
                            </span>
                            {a.user_id && userDisplayNames[a.user_id] && userEmails[a.user_id] && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                {userEmails[a.user_id]}
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-sm">
                        {a.prompt_preview || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {a.scenario_id || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {a.is_public && a.share_id ? (
                          <a 
                            href={`/s/${a.share_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Link2 className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.settings?.participationMode === 'spectator' ? (
                          <Badge variant="outline" className="text-purple-600 border-purple-600">
                            <Eye className="h-3 w-3 mr-1" />
                            Watch
                          </Badge>
                        ) : a.settings?.participationMode === 'jump-in' ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.settings?.conversationTone === 'heated' && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            <Flame className="h-3 w-3 mr-1" />
                            Heated
                          </Badge>
                        )}
                        {a.settings?.conversationTone === 'formal' && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            <Briefcase className="h-3 w-3 mr-1" />
                            Formal
                          </Badge>
                        )}
                        {a.settings?.conversationTone === 'casual' && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            <Coffee className="h-3 w-3 mr-1" />
                            Casual
                          </Badge>
                        )}
                        {a.settings?.conversationTone === 'collaborative' && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <UsersRound className="h-3 w-3 mr-1" />
                            Collab
                          </Badge>
                        )}
                        {!a.settings?.conversationTone && (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {(a.models_used || []).slice(0, 3).map((m, i) => (
                            <Badge key={i} variant="outline" className="text-xs truncate max-w-[100px]">
                              {m.split('/').pop()}
                            </Badge>
                          ))}
                          {(a.models_used || []).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(a.models_used || []).length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{a.num_agents}</TableCell>
                      <TableCell className="text-center">{a.num_rounds}</TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const actualCount = a.chat_id ? actualMessageCounts[a.chat_id] : null;
                          const displayCount = actualCount ?? a.total_messages;
                          const hasMore = actualCount && actualCount > (a.total_messages || 0);
                          return (
                            <span className={hasMore ? 'text-green-600 font-medium' : ''}>
                              {displayCount}
                              {hasMore && <span className="text-xs text-muted-foreground ml-1">↑</span>}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        {a.chat_id && tokenUsageMap[a.chat_id] ? (
                          <Badge variant="outline" className="text-cyan-600 border-cyan-600">
                            {formatTokens(tokenUsageMap[a.chat_id])}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.completed_at ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            ✓
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            ...
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

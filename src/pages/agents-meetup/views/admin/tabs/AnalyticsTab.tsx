import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, Calendar, TrendingUp, Download, RefreshCw, Cpu, Coins } from 'lucide-react';
import { analyticsService, type ChatAnalytics, type AnalyticsSummary, type ModelUsageStats } from '@/services';
import { format } from 'date-fns';

export const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState<ChatAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [modelStats, setModelStats] = useState<ModelUsageStats[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportCsv = () => {
    const headers = ['Date', 'User Type', 'Prompt', 'Scenario', 'Models', 'Agents', 'Rounds', 'Messages', 'Duration (s)'];
    const rows = analytics.map(a => [
      format(new Date(a.created_at), 'yyyy-MM-dd HH:mm'),
      a.is_guest ? 'Guest' : 'User',
      `"${(a.prompt_preview || '').replace(/"/g, '""')}"`,
      a.scenario_id || '',
      (a.models_used || []).join('; '),
      a.num_agents,
      a.num_rounds,
      a.total_messages,
      Math.round((a.generation_duration_ms || 0) / 1000)
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siliconsoap-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(2)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
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
      {/* Summary Cards */}
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
              <Calendar className="h-5 w-5 text-muted-foreground" />
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chat Log</CardTitle>
            <CardDescription>All conversations created on the platform</CardDescription>
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
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="max-w-[300px]">Prompt</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Models</TableHead>
                  <TableHead className="text-center">Agents</TableHead>
                  <TableHead className="text-center">Rounds</TableHead>
                  <TableHead className="text-center">Msgs</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No chat analytics yet. Chats will appear here as users create them.
                    </TableCell>
                  </TableRow>
                ) : (
                  analytics.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(a.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.is_guest ? 'secondary' : 'default'}>
                          {a.is_guest ? 'Guest' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm">
                        {a.prompt_preview || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {a.scenario_id || '-'}
                      </TableCell>
                      <TableCell className="text-xs max-w-[150px]">
                        <div className="flex flex-wrap gap-1">
                          {(a.models_used || []).slice(0, 2).map((m, i) => (
                            <Badge key={i} variant="outline" className="text-xs truncate max-w-[100px]">
                              {m.split('/').pop()}
                            </Badge>
                          ))}
                          {(a.models_used || []).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(a.models_used || []).length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{a.num_agents}</TableCell>
                      <TableCell className="text-center">{a.num_rounds}</TableCell>
                      <TableCell className="text-center">{a.total_messages}</TableCell>
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

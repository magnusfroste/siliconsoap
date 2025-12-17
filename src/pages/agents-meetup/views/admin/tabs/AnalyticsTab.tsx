import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, Users, Calendar, TrendingUp, Download, RefreshCw } from 'lucide-react';
import { analyticsService, type ChatAnalytics, type AnalyticsSummary } from '@/services';
import { format } from 'date-fns';

export const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState<ChatAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, summaryData] = await Promise.all([
        analyticsService.getAll(200),
        analyticsService.getSummary()
      ]);
      setAnalytics(analyticsData);
      setSummary(summaryData);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
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

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Coins, Zap, BarChart3, Clock, 
  MessageSquare, Calendar, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface UserData {
  user_id: string;
  email: string | null;
  display_name: string | null;
  credits_remaining: number;
  credits_used: number;
  token_budget: number;
  tokens_used: number;
  created_at: string;
  total_debates: number;
}

interface TokenUsageRecord {
  id: string;
  model_id: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  created_at: string;
  chat_id: string | null;
}

interface ModelBreakdown {
  model_id: string;
  total_tokens: number;
  call_count: number;
  total_cost: number;
}

interface UserDetailViewProps {
  user: UserData;
  onBack: () => void;
}

export const UserDetailView = ({ user, onBack }: UserDetailViewProps) => {
  const [tokenUsage, setTokenUsage] = useState<TokenUsageRecord[]>([]);
  const [modelBreakdown, setModelBreakdown] = useState<ModelBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(2)}`;
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Fetch token usage history
      const { data: usageData, error } = await supabase
        .from('user_token_usage')
        .select('*')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setTokenUsage(usageData || []);

      // Calculate model breakdown
      const breakdown = new Map<string, ModelBreakdown>();
      (usageData || []).forEach(record => {
        const existing = breakdown.get(record.model_id) || {
          model_id: record.model_id,
          total_tokens: 0,
          call_count: 0,
          total_cost: 0
        };
        existing.total_tokens += record.total_tokens;
        existing.call_count += 1;
        existing.total_cost += Number(record.estimated_cost) || 0;
        breakdown.set(record.model_id, existing);
      });

      setModelBreakdown(
        Array.from(breakdown.values())
          .sort((a, b) => b.total_tokens - a.total_tokens)
      );

    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user.user_id]);

  const totalTokensFromHistory = tokenUsage.reduce((sum, r) => sum + r.total_tokens, 0);
  const totalCostFromHistory = tokenUsage.reduce((sum, r) => sum + (Number(r.estimated_cost) || 0), 0);
  const budgetUsedPercent = user.token_budget > 0 
    ? Math.min(100, (user.tokens_used / user.token_budget) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {user.display_name || user.email || 'Anonymous User'}
          </h2>
          <p className="text-muted-foreground">
            {user.email || user.user_id}
          </p>
        </div>
        <Button variant="outline" size="icon" className="ml-auto" onClick={loadUserData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <Coins className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <p className="text-4xl font-bold">{user.credits_remaining}</p>
                <p className="text-muted-foreground">Credits Remaining</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-muted-foreground">{user.credits_used}</p>
              <p className="text-sm text-muted-foreground">Credits Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{formatTokens(totalTokensFromHistory)}</p>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{tokenUsage.length}</p>
                <p className="text-sm text-muted-foreground">API Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{user.total_debates}</p>
                <p className="text-sm text-muted-foreground">Debates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{formatCost(totalCostFromHistory)}</p>
                <p className="text-sm text-muted-foreground">Est. Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Token Budget</CardTitle>
          <CardDescription>
            Tokens reset when a credit is consumed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatTokens(user.tokens_used)} used</span>
              <span>{formatTokens(user.token_budget)} budget</span>
            </div>
            <Progress value={budgetUsedPercent} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {formatTokens(user.token_budget - user.tokens_used)} remaining in current bucket
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Breakdown */}
      {modelBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage by Model</CardTitle>
            <CardDescription>Token consumption per AI model</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelBreakdown.map((model) => {
                  const modelName = model.model_id.split('/').pop() || model.model_id;
                  const provider = model.model_id.split('/')[0] || 'unknown';
                  
                  return (
                    <TableRow key={model.model_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{modelName}</div>
                          <div className="text-xs text-muted-foreground">{provider}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{model.call_count}</TableCell>
                      <TableCell className="text-right font-mono">{formatTokens(model.total_tokens)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCost(model.total_cost)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Last {tokenUsage.length} API calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : tokenUsage.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No activity recorded yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokenUsage.map((record) => {
                  const modelName = record.model_id.split('/').pop() || record.model_id;
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(record.created_at), 'MMM d, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {modelName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span className="text-muted-foreground">{record.prompt_tokens}</span>
                        <span className="mx-1">→</span>
                        <span>{record.completion_tokens}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCost(Number(record.estimated_cost) || 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

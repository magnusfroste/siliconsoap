import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Users, Coins, RefreshCw, Search, ChevronRight, 
  ArrowUpDown, TrendingUp, Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserDetailView } from './UserDetailView';

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

export const UsersTab = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'credits' | 'tokens' | 'debates'>('credits');
  const [sortDesc, setSortDesc] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch all user credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .order('updated_at', { ascending: false });

      if (creditsError) throw creditsError;

      // Fetch user profiles for display names
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('user_id, display_name');

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.display_name]) || []);

      // Fetch debate counts per user
      const { data: debatesData } = await supabase
        .from('agent_chats')
        .select('user_id')
        .not('user_id', 'is', null);

      const debateCountMap = new Map<string, number>();
      debatesData?.forEach(d => {
        if (d.user_id) {
          debateCountMap.set(d.user_id, (debateCountMap.get(d.user_id) || 0) + 1);
        }
      });

      // Fetch emails using the secure RPC function
      const userIds = creditsData?.map(c => c.user_id) || [];
      const emailMap = new Map<string, string>();
      
      for (const userId of userIds) {
        const { data: email } = await supabase.rpc('get_user_email', { p_user_id: userId });
        if (email) {
          emailMap.set(userId, email);
        }
      }

      const usersData: UserData[] = (creditsData || []).map(credit => ({
        user_id: credit.user_id,
        email: emailMap.get(credit.user_id) || null,
        display_name: profilesMap.get(credit.user_id) || null,
        credits_remaining: credit.credits_remaining,
        credits_used: credit.credits_used,
        token_budget: credit.token_budget,
        tokens_used: credit.tokens_used,
        created_at: credit.created_at || '',
        total_debates: debateCountMap.get(credit.user_id) || 0
      }));

      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users
    .filter(u => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        (u.email?.toLowerCase().includes(query)) ||
        (u.display_name?.toLowerCase().includes(query)) ||
        u.user_id.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aVal = 0, bVal = 0;
      if (sortBy === 'credits') {
        aVal = a.credits_remaining;
        bVal = b.credits_remaining;
      } else if (sortBy === 'tokens') {
        aVal = a.tokens_used;
        bVal = b.tokens_used;
      } else {
        aVal = a.total_debates;
        bVal = b.total_debates;
      }
      return sortDesc ? bVal - aVal : aVal - bVal;
    });

  const totalCreditsRemaining = users.reduce((sum, u) => sum + u.credits_remaining, 0);
  const totalCreditsUsed = users.reduce((sum, u) => sum + u.credits_used, 0);
  const totalTokensUsed = users.reduce((sum, u) => sum + u.tokens_used, 0);

  const handleSort = (column: 'credits' | 'tokens' | 'debates') => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
  };

  if (selectedUser) {
    return (
      <UserDetailView 
        user={selectedUser} 
        onBack={() => setSelectedUser(null)} 
      />
    );
  }

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
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{totalCreditsRemaining}</p>
                <p className="text-sm text-muted-foreground">Credits Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalCreditsUsed}</p>
                <p className="text-sm text-muted-foreground">Credits Used</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{formatTokens(totalTokensUsed)}</p>
                <p className="text-sm text-muted-foreground">Tokens Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>
              Click a user to view detailed usage and activity
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('credits')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Credits
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('tokens')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Tokens Used
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('debates')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Debates
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No users match your search' : 'No users found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow 
                    key={user.user_id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.display_name || user.email || 'Anonymous'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email || user.user_id.slice(0, 8) + '...'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Badge variant={user.credits_remaining > 5 ? 'default' : user.credits_remaining > 0 ? 'secondary' : 'destructive'}>
                          {user.credits_remaining} remaining
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({user.credits_used} used)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatTokens(user.tokens_used)}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.total_debates}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

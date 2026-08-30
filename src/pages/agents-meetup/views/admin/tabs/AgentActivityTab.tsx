import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

interface ActivityEntry {
  id: string;
  created_at: string;
  actor_label: string | null;
  client_id: string | null;
  source: string;
  tool_name: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  success: boolean;
  error_message: string | null;
  input: unknown;
  result: unknown;
  duration_ms: number | null;
}

export const AgentActivityTab = () => {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyFailures, setOnlyFailures] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from('agent_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (onlyFailures) query = query.eq('success', false);
    const { data } = await query;
    setEntries((data as ActivityEntry[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyFailures]);

  const failures = entries.filter((e) => !e.success).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Agent Activity Log</CardTitle>
          <CardDescription>
            Append-only record of every change AI agents made through the MCP server. Entries cannot
            be edited or deleted — this is the verifiable audit trail.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={onlyFailures ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyFailures((v) => !v)}
          >
            Failures {failures > 0 ? `(${failures})` : ''}
          </Button>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && <Skeleton className="h-40 w-full" />}
        {!loading && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No agent activity recorded yet. Actions appear here as soon as an agent runs a write tool
            over MCP.
          </p>
        )}
        {!loading &&
          entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-border p-3">
              <button
                type="button"
                className="flex w-full items-center gap-3 text-left"
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              >
                {entry.success ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive shrink-0" />
                )}
                <span className="font-mono text-sm">{entry.tool_name}</span>
                <Badge variant="secondary">{entry.action}</Badge>
                {entry.target_id && (
                  <span className="truncate text-xs text-muted-foreground">{entry.target_id}</span>
                )}
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                  {entry.duration_ms != null ? ` · ${entry.duration_ms} ms` : ''}
                </span>
              </button>
              {expanded === entry.id && (
                <div className="mt-3 space-y-2 text-xs">
                  <p className="text-muted-foreground">
                    Actor: {entry.actor_label ?? 'unknown'} · client: {entry.client_id ?? 'n/a'} ·
                    source: {entry.source}
                  </p>
                  {entry.error_message && (
                    <p className="text-destructive">Error: {entry.error_message}</p>
                  )}
                  <pre className="overflow-x-auto rounded-md bg-muted p-2">
                    {JSON.stringify({ input: entry.input, result: entry.result }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
      </CardContent>
    </Card>
  );
};

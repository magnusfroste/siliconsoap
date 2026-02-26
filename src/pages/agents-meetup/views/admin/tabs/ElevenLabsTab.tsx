import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Volume2, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ElevenLabsUsage {
  tier: string;
  characterCount: number;
  characterLimit: number;
  characterUsagePercent: number;
  nextResetUnix: number | null;
  status: string;
  hasOpenInvoices: boolean;
  nextInvoice: { amount_due_cents: number } | null;
  voiceSlotsUsed: number;
  maxVoiceAddEdits: number | null;
  voiceAddEditCounter: number;
  userName: string | null;
}

export const ElevenLabsTab = () => {
  const [usage, setUsage] = useState<ElevenLabsUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('elevenlabs-usage');
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setUsage(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch usage';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const formatDate = (unix: number | null) => {
    if (!unix) return 'N/A';
    return new Date(unix * 1000).toLocaleDateString('sv-SE', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatNumber = (n: number) => n.toLocaleString('sv-SE');

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 mx-auto text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchUsage}>
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const isHigh = usage.characterUsagePercent >= 80;
  const isCritical = usage.characterUsagePercent >= 95;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            ElevenLabs Usage
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time usage data from the ElevenLabs API
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsage}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Character Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Character Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatNumber(usage.characterCount)}
              </span>
              <span className="text-sm text-muted-foreground">
                / {formatNumber(usage.characterLimit)}
              </span>
            </div>
            <Progress
              value={usage.characterUsagePercent}
              className={isCritical ? '[&>div]:bg-destructive' : isHigh ? '[&>div]:bg-amber-500' : ''}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={isCritical ? 'text-destructive font-medium' : isHigh ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
                {usage.characterUsagePercent}% used
              </span>
              {(isHigh || isCritical) && (
                <Badge variant={isCritical ? 'destructive' : 'outline'} className={!isCritical ? 'border-amber-500 text-amber-600' : ''}>
                  {isCritical ? '⚠️ Critical' : '⚠️ High'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize text-base px-3 py-1">
                {usage.tier}
              </Badge>
              <Badge variant={usage.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                {usage.status}
              </Badge>
            </div>
            {usage.nextInvoice && (
              <p className="text-sm text-muted-foreground">
                Next invoice: ${(usage.nextInvoice.amount_due_cents / 100).toFixed(2)}
              </p>
            )}
            {usage.hasOpenInvoices && (
              <Badge variant="destructive">Open invoices</Badge>
            )}
          </CardContent>
        </Card>

        {/* Reset & Voices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reset & Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Resets: {formatDate(usage.nextResetUnix)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Voice slots used: {usage.voiceSlotsUsed}
            </p>
            <p className="text-sm text-muted-foreground">
              Voice edits: {usage.voiceAddEditCounter}
              {usage.maxVoiceAddEdits != null && ` / ${usage.maxVoiceAddEdits}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Characters remaining */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Characters remaining this period</p>
              <p className="text-3xl font-bold">
                {formatNumber(usage.characterLimit - usage.characterCount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Approx. TTS messages left</p>
              <p className="text-3xl font-bold text-muted-foreground">
                ~{Math.floor((usage.characterLimit - usage.characterCount) / 500)}
              </p>
              <p className="text-xs text-muted-foreground">@ 500 chars/message avg</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

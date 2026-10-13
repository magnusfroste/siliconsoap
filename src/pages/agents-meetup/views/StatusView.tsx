import { PageHeader } from '@/components/editorial/PageHeader';
import { OriginChip } from '@/components/model-chips';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { shortModelName } from '@/services/rosterService';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Circle, Play, Ban } from 'lucide-react';
import { getEnabledModels, disableModel } from '@/repositories/curatedModelsRepository';
import { CuratedModel } from '@/models';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ModelStatus {
  model_id: string;
  status: 'unknown' | 'operational' | 'degraded' | 'down' | 'checking';
  response_time_ms: number | null;
  error_message: string | null;
  raw_response: string | null;
  last_checked_at: Date | null;
}

const StatusIcon = ({ status }: { status: ModelStatus['status'] }) => {
  switch (status) {
    case 'operational':
      return <CheckCircle2 className="h-5 w-5 text-chip-open-fg" />;
    case 'degraded':
      return <AlertTriangle className="h-5 w-5 text-chip-warning-fg" />;
    case 'down':
      return <XCircle className="h-5 w-5 text-chip-slow-fg" />;
    case 'checking':
      return <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
};

const StatusBadge = ({ status }: { status: ModelStatus['status'] }) => {
  const variants: Record<ModelStatus['status'], { label: string; className: string }> = {
    operational: { label: 'Operational', className: 'bg-chip-open-bg text-chip-open-fg border-transparent' },
    degraded: { label: 'Degraded', className: 'bg-chip-warning-bg text-chip-warning-fg border-transparent' },
    down: { label: 'Down', className: 'bg-chip-slow-bg text-chip-slow-fg border-transparent' },
    checking: { label: 'Checking...', className: 'bg-muted text-muted-foreground' },
    unknown: { label: 'Unknown', className: 'bg-muted text-muted-foreground' },
  };

  const { label, className } = variants[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export const StatusView = () => {
  usePageMeta({
    title: 'Status',
    description: 'Live health checks for the models on SiliconSoap.',
    canonicalPath: '/status',
  });

  const { isAdmin } = useIsAdmin();
  const [models, setModels] = useState<CuratedModel[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ModelStatus>>({});
  const [loading, setLoading] = useState(true);
  const [checkingAll, setCheckingAll] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const enabledModels = await getEnabledModels();
      setModels(enabledModels);
      
      // Initialize status for all models
      const initialStatuses: Record<string, ModelStatus> = {};
      enabledModels.forEach(model => {
        initialStatuses[model.model_id] = {
          model_id: model.model_id,
          status: 'unknown',
          response_time_ms: null,
          error_message: null,
          raw_response: null,
          last_checked_at: null,
        };
      });
      setStatuses(initialStatuses);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkModel = useCallback(async (modelId: string) => {
    console.log(`[Status Check] Testing: ${modelId}`);
    
    setStatuses(prev => ({
      ...prev,
      [modelId]: { ...prev[modelId], status: 'checking' },
    }));

    try {
      const { data, error } = await supabase.functions.invoke('check-model-status', {
        body: { model_id: modelId },
      });

      if (error) throw error;

      const result: ModelStatus = {
        model_id: modelId,
        status: data.status,
        response_time_ms: data.response_time_ms,
        error_message: data.error_message,
        raw_response: data.raw_response,
        last_checked_at: new Date(),
      };

      // Log result with emoji
      const emoji = result.status === 'operational' ? '✅' : result.status === 'degraded' ? '⚠️' : '❌';
      console.log(`[Status Check] ${emoji} ${modelId} - ${result.status.toUpperCase()}${result.response_time_ms ? ` (${result.response_time_ms}ms)` : ''}${result.error_message ? ` - ${result.error_message}` : ''}`);

      setStatuses(prev => ({
        ...prev,
        [modelId]: result,
      }));

      return result;
    } catch (error) {
      console.error(`[Status Check] ❌ ${modelId} - Error:`, error);
      
      const result: ModelStatus = {
        model_id: modelId,
        status: 'down',
        response_time_ms: null,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        raw_response: null,
        last_checked_at: new Date(),
      };

      setStatuses(prev => ({
        ...prev,
        [modelId]: result,
      }));

      return result;
    }
  }, []);

  const handleDisableModel = async (model: CuratedModel) => {
    try {
      await disableModel(model.id);
      toast.success(`Disabled ${model.display_name}`);
      // Remove from local state
      setModels(prev => prev.filter(m => m.id !== model.id));
      setStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[model.model_id];
        return newStatuses;
      });
    } catch (error) {
      console.error('Failed to disable model:', error);
      toast.error('Failed to disable model');
    }
  };

  const checkAllModels = async () => {
    setCheckingAll(true);
    console.log(`[Status Check] Starting check for ${models.length} models...`);

    const results = { operational: 0, degraded: 0, down: 0 };

    for (const model of models) {
      const result = await checkModel(model.model_id);
      if (result.status === 'operational') results.operational++;
      else if (result.status === 'degraded') results.degraded++;
      else results.down++;
      
      // Small delay between checks to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[Status Check] Complete: ${results.operational} OK, ${results.degraded} Degraded, ${results.down} Down`);
    setCheckingAll(false);
  };

  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, CuratedModel[]>);

  // Calculate summary
  const statusCounts = Object.values(statuses).reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:py-12 md:px-8 space-y-6">
      <PageHeader eyebrow="Service checks" title="Status" lead="Health checks for the models on the SiliconSoap roster." action={isAdmin ? (<Button 
          onClick={checkAllModels} 
          disabled={checkingAll}
          size="lg"
        >
          {checkingAll ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Check
            </>
          )}
        </Button>) : undefined} />

      {(() => {
        const hasResults = Object.values(statuses).some(s => s.status !== 'unknown');
        return !hasResults && !isAdmin;
      })() ? (
        <Card className="rounded-lg shadow-none">
          <CardContent className="pt-6 text-muted-foreground">No recent checks.</CardContent>
        </Card>
      ) : (<>
      {/* Summary */}
      <Card className="rounded-lg shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-chip-open-fg" />
              <span className="font-medium">{statusCounts.operational || 0}</span>
              <span className="text-muted-foreground">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-chip-warning-fg" />
              <span className="font-medium">{statusCounts.degraded || 0}</span>
              <span className="text-muted-foreground">Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-chip-slow-fg" />
              <span className="font-medium">{statusCounts.down || 0}</span>
              <span className="text-muted-foreground">Down</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{statusCounts.unknown || 0}</span>
              <span className="text-muted-foreground">Unknown</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Models by Provider */}
      {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
        <section key={provider} className="border-b pb-4">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl">{provider}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {providerModels.map(model => {
              const status = statuses[model.model_id];
              return (
                <div 
                  key={model.id} 
                  className={cn(
                    "py-4 border-b last:border-b-0",
                    status?.status === 'down' && "border-border bg-chip-slow-bg/30",
                    status?.status === 'degraded' && "border-border bg-chip-warning-bg/30",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusIcon status={status?.status || 'unknown'} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 font-medium">{shortModelName(model.display_name)}<OriginChip origin={model.origin_region} compact /></div>
                        <div className="text-xs text-muted-foreground break-all">{model.model_id}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {status?.response_time_ms && (
                        <span className="text-sm text-muted-foreground">
                          {(status.response_time_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                      <StatusBadge status={status?.status || 'unknown'} />
                      {isAdmin && (<>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => checkModel(model.model_id)}
                        disabled={status?.status === 'checking' || checkingAll}
                      >
                        {status?.status === 'checking' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisableModel(model)}
                        className="min-h-11 min-w-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Disable this model"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      </>)}
                    </div>
                  </div>
                  
                  {/* Error message */}
                  {status?.error_message && status.status !== 'operational' && (
                    <div className="mt-3 p-2 rounded bg-muted/50 text-sm">
                      <span className="text-muted-foreground">Error: </span>
                      <span className="text-foreground">{status.error_message}</span>
                    </div>
                  )}
                  
                  {/* Last checked */}
                  {status?.last_checked_at && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last checked: {status.last_checked_at.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </section>
      ))}
      </>)}
    </div>
  );
};

export default StatusView;

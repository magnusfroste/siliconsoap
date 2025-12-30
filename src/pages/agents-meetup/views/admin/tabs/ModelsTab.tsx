import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CuratedModelsManager } from '../../components/CuratedModelsManager';
import { toast } from 'sonner';

export const ModelsTab = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{ success: boolean; updated: number; notFound: number } | null>(null);

  const handleSyncPricing = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-model-pricing');
      
      if (error) {
        console.error('Sync error:', error);
        toast.error('Failed to sync pricing');
        return;
      }

      if (data?.success) {
        setLastSync({ success: true, updated: data.updated, notFound: data.notFound });
        toast.success(`Synced pricing for ${data.updated} models`);
      } else {
        toast.error(data?.error || 'Sync failed');
      }
    } catch (err) {
      console.error('Sync error:', err);
      toast.error('Failed to sync pricing');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">Curated Models</h2>
        <p className="text-sm text-muted-foreground">
          Manage which OpenRouter models are available to users
        </p>
      </div>

      {/* Sync Pricing Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">Sync Model Pricing</h3>
            <p className="text-sm text-muted-foreground">
              Fetch latest pricing from OpenRouter and update price tiers
            </p>
          </div>
          <Button onClick={handleSyncPricing} disabled={syncing} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Pricing'}
          </Button>
        </div>
        
        {lastSync && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
            {lastSync.success ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">
                  Updated {lastSync.updated} models
                  {lastSync.notFound > 0 && ` • ${lastSync.notFound} not found in OpenRouter`}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-500">Sync failed</span>
              </>
            )}
          </div>
        )}
      </Card>

      <CuratedModelsManager />
    </div>
  );
};

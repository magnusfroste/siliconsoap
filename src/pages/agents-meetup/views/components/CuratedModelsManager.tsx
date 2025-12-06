import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Plus, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  getAllCuratedModels,
  toggleModelEnabled,
  addCuratedModel,
  removeCuratedModel,
  CuratedModel,
} from '@/repositories/curatedModelsRepository';
import { fetchOpenRouterModels } from '@/utils/openRouter';
import { OpenRouterModel } from '@/utils/openRouter/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export const CuratedModelsManager = () => {
  const [curatedModels, setCuratedModels] = useState<CuratedModel[]>([]);
  const [allOpenRouterModels, setAllOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCuratedModels = useCallback(async () => {
    try {
      const models = await getAllCuratedModels();
      setCuratedModels(models);
    } catch (error) {
      toast.error('Failed to load curated models');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCuratedModels();
  }, [loadCuratedModels]);

  const handleFetchAllModels = async () => {
    setFetchingModels(true);
    try {
      const models = await fetchOpenRouterModels('');
      setAllOpenRouterModels(models);
      setAddDialogOpen(true);
      toast.success(`Fetched ${models.length} models from OpenRouter`);
    } catch (error) {
      toast.error('Failed to fetch models from OpenRouter');
    } finally {
      setFetchingModels(false);
    }
  };

  const handleToggleEnabled = async (model: CuratedModel) => {
    try {
      await toggleModelEnabled(model.id, !model.is_enabled);
      setCuratedModels(prev =>
        prev.map(m => (m.id === model.id ? { ...m, is_enabled: !m.is_enabled } : m))
      );
      toast.success(`${model.display_name} ${!model.is_enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle model');
    }
  };

  const handleAddModel = async (model: OpenRouterModel) => {
    try {
      const newModel = await addCuratedModel({
        model_id: model.id,
        display_name: model.name,
        provider: model.provider || 'Unknown',
        is_enabled: true,
        is_free: model.isFree || false,
        sort_order: curatedModels.length + 1,
      });
      setCuratedModels(prev => [...prev, newModel]);
      toast.success(`Added ${model.name} to curated list`);
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Model already in curated list');
      } else {
        toast.error('Failed to add model');
      }
    }
  };

  const handleRemoveModel = async (model: CuratedModel) => {
    try {
      await removeCuratedModel(model.id);
      setCuratedModels(prev => prev.filter(m => m.id !== model.id));
      toast.success(`Removed ${model.display_name}`);
    } catch (error) {
      toast.error('Failed to remove model');
    }
  };

  // Filter OpenRouter models that aren't already curated
  const curatedModelIds = new Set(curatedModels.map(m => m.model_id));
  const availableToAdd = allOpenRouterModels.filter(m => !curatedModelIds.has(m.id));
  const filteredModels = availableToAdd.filter(
    m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.provider || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by provider
  const modelsByProvider = filteredModels.reduce((acc, model) => {
    const provider = model.provider || 'Other';
    if (!acc[provider]) acc[provider] = [];
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, OpenRouterModel[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage which models are available for users to select
        </p>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchAllModels}
              disabled={fetchingModels}
            >
              {fetchingModels ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Models
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Add Models to Curated List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-[50vh]">
                <div className="space-y-4 pr-4">
                  {Object.keys(modelsByProvider)
                    .sort()
                    .map(provider => (
                      <div key={provider}>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                          {provider}
                        </h4>
                        <div className="space-y-1">
                          {modelsByProvider[provider].map(model => (
                            <div
                              key={model.id}
                              className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{model.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {model.id}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {model.isFree && (
                                  <Badge variant="secondary" className="text-xs">
                                    FREE
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleAddModel(model)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  {filteredModels.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      {searchQuery ? 'No models match your search' : 'All models already curated'}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {curatedModels.map(model => (
          <div
            key={model.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{model.display_name}</p>
                <Badge variant="outline" className="text-xs">
                  {model.provider}
                </Badge>
                {model.is_free && (
                  <Badge variant="secondary" className="text-xs">
                    FREE
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{model.model_id}</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={model.is_enabled}
                onCheckedChange={() => handleToggleEnabled(model)}
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleRemoveModel(model)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {curatedModels.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No curated models yet. Click "Add Models" to get started.
          </p>
        )}
      </div>
    </div>
  );
};

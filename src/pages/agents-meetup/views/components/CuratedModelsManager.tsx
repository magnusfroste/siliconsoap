import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Search, Sparkles, ChevronDown, Check, AlertTriangle, Cloud, Server } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { modelInfoService } from '@/services';
import {
  getAllCuratedModels,
  toggleModelEnabled,
  addCuratedModel,
  removeCuratedModel,
  updateModelContent,
  setDefaultModelForAgent,
  CuratedModel,
} from '@/repositories/curatedModelsRepository';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export const CuratedModelsManager = () => {
  const [curatedModels, setCuratedModels] = useState<CuratedModel[]>([]);
  const [allOpenRouterModels, setAllOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatingForModel, setGeneratingForModel] = useState<string | null>(null);
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

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

  const handleSetDefaultAgent = async (model: CuratedModel, agent: string | null) => {
    try {
      await setDefaultModelForAgent(model.id, agent);
      // Update local state - clear previous default for this agent, set new one
      setCuratedModels(prev =>
        prev.map(m => {
          if (m.id === model.id) {
            return { ...m, default_for_agent: agent };
          }
          // Clear any other model that had this agent as default
          if (agent && m.default_for_agent === agent) {
            return { ...m, default_for_agent: null };
          }
          return m;
        })
      );
      toast.success(agent 
        ? `${model.display_name} set as default for Agent ${agent}` 
        : `Removed default assignment for ${model.display_name}`
      );
    } catch (error) {
      toast.error('Failed to set default agent');
    }
  };

  const handleSetLicenseType = async (model: CuratedModel, licenseType: 'open-weight' | 'closed') => {
    try {
      await updateModelContent(model.id, { license_type: licenseType });
      setCuratedModels(prev =>
        prev.map(m => (m.id === model.id ? { ...m, license_type: licenseType } : m))
      );
      toast.success(`${model.display_name} set to ${licenseType === 'open-weight' ? 'Open-Weight' : 'Cloud-Only'}`);
    } catch (error) {
      toast.error('Failed to update license type');
    }
  };

  const handleGenerateModelInfo = async (model: CuratedModel) => {
    setGeneratingForModel(model.id);
    try {
      const data = await modelInfoService.generateModelInfo({
        model_id: model.model_id,
        display_name: model.display_name,
        provider: model.provider,
      });

      // Update the model with generated content
      await updateModelContent(model.id, {
        description: data.description,
        pros: data.pros,
        cons: data.cons,
        use_cases: data.use_cases,
        avoid_cases: data.avoid_cases,
        category: data.category,
        speed_rating: data.speed_rating,
        context_window: parseInt(data.context_window) || null,
      });

      // Update local state
      setCuratedModels(prev =>
        prev.map(m =>
          m.id === model.id
            ? {
                ...m,
                description: data.description,
                pros: data.pros,
                cons: data.cons,
                use_cases: data.use_cases,
                avoid_cases: data.avoid_cases,
                category: data.category,
                speed_rating: data.speed_rating,
                context_window: parseInt(data.context_window) || null,
              }
            : m
        )
      );

      // Auto-expand the model to show generated content
      setExpandedModels(prev => new Set([...prev, model.id]));
      toast.success(`Generated info for ${model.display_name}`);
    } catch (error: any) {
      console.error('Error generating model info:', error);
      toast.error(error.message || 'Failed to generate model info');
    } finally {
      setGeneratingForModel(null);
    }
  };

  const handleGenerateAllInfo = async () => {
    const modelsWithoutContent = curatedModels.filter(m => !hasEducationalContent(m));
    
    if (modelsWithoutContent.length === 0) {
      toast.info('All models already have educational content');
      return;
    }

    setGeneratingAll(true);
    setGenerationProgress({ current: 0, total: modelsWithoutContent.length });

    for (let i = 0; i < modelsWithoutContent.length; i++) {
      const model = modelsWithoutContent[i];
      setGenerationProgress({ current: i + 1, total: modelsWithoutContent.length });
      setGeneratingForModel(model.id);

      try {
        const data = await modelInfoService.generateModelInfo({
          model_id: model.model_id,
          display_name: model.display_name,
          provider: model.provider,
        });

        await updateModelContent(model.id, {
          description: data.description,
          pros: data.pros,
          cons: data.cons,
          use_cases: data.use_cases,
          avoid_cases: data.avoid_cases,
          category: data.category,
          speed_rating: data.speed_rating,
          context_window: parseInt(data.context_window) || null,
        });

        setCuratedModels(prev =>
          prev.map(m =>
            m.id === model.id
              ? {
                  ...m,
                  description: data.description,
                  pros: data.pros,
                  cons: data.cons,
                  use_cases: data.use_cases,
                  avoid_cases: data.avoid_cases,
                  category: data.category,
                  speed_rating: data.speed_rating,
                  context_window: parseInt(data.context_window) || null,
                }
              : m
          )
        );
      } catch (error: any) {
        console.error(`Error generating info for ${model.display_name}:`, error);
        // Continue with next model even if one fails
      }

      // Small delay between requests to avoid rate limiting
      if (i < modelsWithoutContent.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setGeneratingForModel(null);
    setGeneratingAll(false);
    setGenerationProgress({ current: 0, total: 0 });
    toast.success(`Generated info for ${modelsWithoutContent.length} models`);
  };

  const toggleModelExpanded = (modelId: string) => {
    setExpandedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
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

  const hasEducationalContent = (model: CuratedModel) =>
    model.description || model.pros?.length || model.cons?.length || model.use_cases?.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Manage which models are available for users to select
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAllInfo}
            disabled={generatingAll || generatingForModel !== null}
            className="gap-1.5"
          >
            {generatingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {generationProgress.current}/{generationProgress.total}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate All Info
              </>
            )}
          </Button>
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
      </div>

      <div className="space-y-2">
        {curatedModels.map(model => {
          const isExpanded = expandedModels.has(model.id);
          const hasContent = hasEducationalContent(model);

          return (
            <Collapsible
              key={model.id}
              open={isExpanded}
              onOpenChange={() => toggleModelExpanded(model.id)}
            >
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="flex items-center justify-between p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{model.display_name}</p>
                        <Badge variant="outline" className="text-xs">
                          {model.provider}
                        </Badge>
                        {/* License type badge */}
                        {model.license_type === 'open-weight' ? (
                          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                            <Server className="h-2.5 w-2.5" />
                            Open
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-600 border-sky-500/30 gap-1">
                            <Cloud className="h-2.5 w-2.5" />
                            Cloud
                          </Badge>
                        )}
                        {model.is_free && (
                          <Badge variant="secondary" className="text-xs">
                            FREE
                          </Badge>
                        )}
                        {model.default_for_agent && (
                          <Badge variant="default" className="text-xs">
                            Default: Agent {model.default_for_agent}
                          </Badge>
                        )}
                        {hasContent && (
                          <Badge variant="default" className="text-xs bg-primary/20 text-primary">
                            Has Info
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{model.model_id}</p>
                    </div>
                  <div className="flex items-center gap-2">
                    {/* License type selector */}
                    <Select
                      value={model.license_type || 'closed'}
                      onValueChange={(value) => handleSetLicenseType(model, value as 'open-weight' | 'closed')}
                    >
                      <SelectTrigger className="w-[90px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open-weight">
                          <span className="flex items-center gap-1.5">
                            <Server className="h-3 w-3 text-emerald-600" />
                            Open
                          </span>
                        </SelectItem>
                        <SelectItem value="closed">
                          <span className="flex items-center gap-1.5">
                            <Cloud className="h-3 w-3 text-sky-600" />
                            Cloud
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={model.default_for_agent || 'none'}
                      onValueChange={(value) => handleSetDefaultAgent(model, value === 'none' ? null : value)}
                    >
                      <SelectTrigger className="w-[100px] h-8 text-xs">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="A">Agent A</SelectItem>
                        <SelectItem value="B">Agent B</SelectItem>
                        <SelectItem value="C">Agent C</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateModelInfo(model)}
                      disabled={generatingForModel === model.id}
                      className="gap-1.5"
                    >
                      {generatingForModel === model.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {hasContent ? 'Regenerate' : 'Generate'} Info
                    </Button>
                    <Switch
                      checked={model.is_enabled}
                      onCheckedChange={() => handleToggleEnabled(model)}
                    />
                    <CollapsibleTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <ChevronDown
                          className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                        />
                      </Button>
                    </CollapsibleTrigger>
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

                <CollapsibleContent>
                  <div className="border-t p-4 space-y-4 bg-muted/30">
                    {hasContent ? (
                      <>
                        {model.description && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Description
                            </label>
                            <p className="text-sm mt-1">{model.description}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {model.pros && model.pros.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-green-600 flex items-center gap-1">
                                <Check className="h-3 w-3" /> Strengths
                              </label>
                              <ul className="mt-1 space-y-1">
                                {model.pros.map((pro, i) => (
                                  <li key={i} className="text-xs text-muted-foreground">
                                    • {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {model.cons && model.cons.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Limitations
                              </label>
                              <ul className="mt-1 space-y-1">
                                {model.cons.map((con, i) => (
                                  <li key={i} className="text-xs text-muted-foreground">
                                    • {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {model.use_cases && model.use_cases.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">
                                Best For
                              </label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {model.use_cases.map((uc, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {uc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {model.avoid_cases && model.avoid_cases.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">
                                Avoid For
                              </label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {model.avoid_cases.map((ac, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {ac}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {model.category && (
                            <span>
                              Category: <strong className="capitalize">{model.category}</strong>
                            </span>
                          )}
                          {model.speed_rating && (
                            <span>
                              Speed: <strong className="capitalize">{model.speed_rating}</strong>
                            </span>
                          )}
                          {model.context_window && (
                            <span>
                              Context:{' '}
                              <strong>
                                {model.context_window >= 1000
                                  ? `${Math.round(model.context_window / 1000)}K`
                                  : model.context_window}
                              </strong>
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          No educational content yet
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateModelInfo(model)}
                          disabled={generatingForModel === model.id}
                          className="gap-1.5"
                        >
                          {generatingForModel === model.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          Generate with AI
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
        {curatedModels.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No curated models yet. Click "Add Models" to get started.
          </p>
        )}
      </div>
    </div>
  );
};

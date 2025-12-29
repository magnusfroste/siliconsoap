import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, Zap, Clock, Check, AlertTriangle, Target, Ban, Play, Cloud, Server, ExternalLink } from 'lucide-react';
import { CuratedModel } from '@/repositories/curatedModelsRepository';
import { cn } from '@/lib/utils';

// Generate Hugging Face search URL from model ID
const getHuggingFaceUrl = (modelId: string): string => {
  const modelName = modelId.split('/').pop() || modelId;
  return `https://huggingface.co/models?search=${encodeURIComponent(modelName)}`;
};

interface ModelCardProps {
  model: CuratedModel;
}

export const ModelCard = ({ model }: ModelCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasEducationalContent = model.description || 
    (model.pros && model.pros.length > 0) || 
    (model.cons && model.cons.length > 0) ||
    (model.use_cases && model.use_cases.length > 0);

  const getSpeedIcon = () => {
    switch (model.speed_rating) {
      case 'fast':
        return <Zap className="h-3.5 w-3.5 text-green-500" />;
      case 'medium':
        return <Clock className="h-3.5 w-3.5 text-yellow-500" />;
      case 'slow':
        return <Clock className="h-3.5 w-3.5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'reasoning':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'creative':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'fast':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'balanced':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatContextWindow = (tokens: number | null) => {
    if (!tokens) return null;
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
    return tokens.toString();
  };

  const handleHeaderClick = () => {
    if (hasEducationalContent) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-colors">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div 
          className={cn(
            "p-4 transition-colors",
            hasEducationalContent && "cursor-pointer hover:bg-muted/50"
          )}
          onClick={handleHeaderClick}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{model.display_name}</h3>
                {/* License type badge */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {model.license_type === 'open-weight' ? (
                        <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                          <Server className="h-3 w-3" />
                          Open Source
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-600 border-sky-500/30 gap-1">
                          <Cloud className="h-3 w-3" />
                          Cloud API
                        </Badge>
                      )}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {model.license_type === 'open-weight' 
                        ? 'Open-weight model - kan köras på egen hårdvara. Testa här innan du kör lokalt!'
                        : 'Cloud-only model - endast tillgänglig via API'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* Hugging Face link for open-weight models */}
                {model.license_type === 'open-weight' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a 
                          href={getHuggingFaceUrl(model.model_id)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          🤗
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        Hitta på Hugging Face
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {model.is_free && (
                  <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                    FREE
                  </Badge>
                )}
                {model.category && (
                  <Badge variant="outline" className={cn("text-xs capitalize", getCategoryColor(model.category))}>
                    {model.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-mono truncate mt-1">
                {model.model_id}
              </p>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                {getSpeedIcon() && (
                  <span className="flex items-center gap-1">
                    {getSpeedIcon()}
                    <span className="capitalize">{model.speed_rating}</span>
                  </span>
                )}
                {model.context_window && (
                  <span className="flex items-center gap-1">
                    <span className="text-xs">📝</span>
                    {formatContextWindow(model.context_window)} context
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div onClick={(e) => e.stopPropagation()}>
                <Link to="/new">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Play className="h-3.5 w-3.5" />
                    Try
                  </Button>
                </Link>
              </div>
              {hasEducationalContent && (
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )} />
              )}
            </div>
          </div>
        </div>

        {hasEducationalContent && (
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-0 border-t">
              <div className="pt-4 space-y-4">
                {/* Description */}
                {model.description && (
                  <p className="text-sm text-muted-foreground">
                    {model.description}
                  </p>
                )}

                {/* Pros & Cons Grid */}
                {((model.pros && model.pros.length > 0) || (model.cons && model.cons.length > 0)) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {model.pros && model.pros.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1.5 text-green-600">
                          <Check className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {model.pros.map((pro, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-500 shrink-0">•</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {model.cons && model.cons.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1.5 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          Limitations
                        </h4>
                        <ul className="space-y-1">
                          {model.cons.map((con, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-amber-500 shrink-0">•</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Use Cases */}
                {((model.use_cases && model.use_cases.length > 0) || (model.avoid_cases && model.avoid_cases.length > 0)) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {model.use_cases && model.use_cases.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1.5 text-primary">
                          <Target className="h-4 w-4" />
                          Best For
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {model.use_cases.map((useCase, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {model.avoid_cases && model.avoid_cases.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                          <Ban className="h-4 w-4" />
                          Avoid For
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {model.avoid_cases.map((avoidCase, i) => (
                            <Badge key={i} variant="outline" className="text-xs text-muted-foreground">
                              {avoidCase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </Card>
  );
};

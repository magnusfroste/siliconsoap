import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { CuratedModel } from '@/repositories/curatedModelsRepository';
import { CuratedModel } from '@/repositories/curatedModelsRepository';

interface ModelsByProvider {
  [provider: string]: CuratedModel[];
}

interface ModelSelectorProps {
  agentModel: string;
  setAgentModel: (model: string) => void;
  modelsByProvider: ModelsByProvider;
  loadingModels: boolean;
  isDisabled: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  agentModel,
  setAgentModel,
  modelsByProvider,
  loadingModels,
  isDisabled,
}) => {
  const hasModels = modelsByProvider && Object.keys(modelsByProvider).length > 0;

  // If loading, show a static disabled trigger instead of a Select (avoids BubbleSelect issues)
  if (loadingModels) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="h-8 text-sm flex-1 flex items-center gap-1 px-3 rounded-md border border-input bg-background text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Loading...</span>
        </div>
        <ModelInfoLink />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Select value={agentModel} onValueChange={setAgentModel} disabled={isDisabled || !hasModels}>
        <SelectTrigger className="h-8 text-sm flex-1">
          <SelectValue placeholder={hasModels ? "Select model" : "No models available"} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {hasModels && Object.keys(modelsByProvider).sort().map(provider => (
            <SelectGroup key={provider}>
              <SelectLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {provider}
              </SelectLabel>
              {modelsByProvider[provider].map(model => (
                <SelectItem key={model.model_id} value={model.model_id}>
                  {model.display_name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      <ModelInfoLink />
    </div>
  );
};

const ModelInfoLink = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/models"
          className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="h-4 w-4" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Explore all models</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

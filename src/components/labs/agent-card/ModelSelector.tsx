import React from 'react';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Info } from 'lucide-react';
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

  return (
    <div className="flex items-center gap-1.5">
      <Select value={agentModel} onValueChange={setAgentModel} disabled={isDisabled || (!hasModels && !loadingModels)}>
        <SelectTrigger className="h-8 text-sm flex-1">
          <SelectValue placeholder={loadingModels ? "Loading models..." : hasModels ? "Select model" : "No models available"} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {loadingModels ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading models...</span>
            </div>
          ) : !hasModels ? (
            <div className="flex items-center justify-center py-2 text-sm text-gray-500">
              <span>No models available.</span>
            </div>
          ) : (
            Object.keys(modelsByProvider).sort().map(provider => (
              <div key={provider}>
                <SelectItem value={`provider-${provider}`} disabled className="font-semibold text-xs uppercase tracking-wider text-gray-500 py-1">
                  {provider}
                </SelectItem>
                {modelsByProvider[provider].map(model => (
                  <SelectItem key={model.model_id} value={model.model_id} className="pl-6">
                    {model.display_name}
                  </SelectItem>
                ))}
              </div>
            ))
          )}
        </SelectContent>
      </Select>
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
    </div>
  );
};

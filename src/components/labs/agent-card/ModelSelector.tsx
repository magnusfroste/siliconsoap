import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ModelsByProvider } from './types';

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
  // Debug log when component renders or props change
  useEffect(() => {
    console.log("ModelSelector rendered with:", {
      agentModel,
      loadingModels,
      isDisabled,
      providersCount: Object.keys(modelsByProvider || {}).length,
      providers: Object.keys(modelsByProvider || {})
    });
  }, [agentModel, modelsByProvider, loadingModels, isDisabled]);

  // Check if we have any models to display
  const hasModels = modelsByProvider && Object.keys(modelsByProvider).length > 0;

  return (
    <div>
      <Select value={agentModel} onValueChange={setAgentModel} disabled={isDisabled || (!hasModels && !loadingModels)}>
        <SelectTrigger className="h-8 text-sm">
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
              <span>No models available. Please check your API key.</span>
            </div>
          ) : (
            Object.keys(modelsByProvider).sort().map(provider => (
              <div key={provider}>
                <SelectItem value={`provider-${provider}`} disabled className="font-semibold text-xs uppercase tracking-wider text-gray-500 py-1">
                  {provider}
                </SelectItem>
                {modelsByProvider[provider].map(model => (
                  <SelectItem key={model.id} value={model.id} className="pl-6">
                    {model.name}
                  </SelectItem>
                ))}
              </div>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

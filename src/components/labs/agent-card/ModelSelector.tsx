
import React from 'react';
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
  return (
    <div>
      <h3 className="text-xs font-medium mb-1">Model</h3>
      <Select value={agentModel} onValueChange={setAgentModel} disabled={isDisabled}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder={loadingModels ? "Loading models..." : "Select model"} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {loadingModels ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading models...</span>
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

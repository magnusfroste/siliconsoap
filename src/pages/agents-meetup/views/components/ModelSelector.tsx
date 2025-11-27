import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchOpenRouterModels } from '@/utils/openRouter';
import { OpenRouterModel } from '@/utils/openRouter/types';

interface ModelSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ModelSelector = ({ label, value, onChange }: ModelSelectorProps) => {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const fetchedModels = await fetchOpenRouterModels(''); // Use shared key
        setModels(fetchedModels);
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    const provider = model.provider || 'Other';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, OpenRouterModel[]>);

  // Sort providers alphabetically
  const sortedProviders = Object.keys(modelsByProvider).sort();

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model..." />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {sortedProviders.map((provider) => (
            <SelectGroup key={provider}>
              <SelectLabel className="text-xs font-semibold uppercase text-muted-foreground">
                {provider}
              </SelectLabel>
              {modelsByProvider[provider].map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    {model.isFree && (
                      <span className="text-xs text-green-600 dark:text-green-400">FREE</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

import { useState, useEffect } from 'react';
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
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { Badge } from '@/components/ui/badge';

interface CuratedModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CuratedModelSelector = ({ value, onChange }: CuratedModelSelectorProps) => {
  const [models, setModels] = useState<CuratedModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const fetchedModels = await getEnabledModels();
        setModels(fetchedModels);
      } catch (error) {
        console.error('Error loading curated models:', error);
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
  }, {} as Record<string, CuratedModel[]>);

  // Sort providers alphabetically
  const sortedProviders = Object.keys(modelsByProvider).sort();

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
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
              <SelectItem key={model.model_id} value={model.model_id}>
                <div className="flex items-center gap-2">
                  <span>{model.display_name}</span>
                  {model.is_free && (
                    <Badge variant="secondary" className="text-xs">FREE</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
        {models.length === 0 && (
          <div className="p-2 text-sm text-muted-foreground text-center">
            No curated models available
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

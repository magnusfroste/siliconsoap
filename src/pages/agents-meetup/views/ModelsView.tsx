import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, ExternalLink, Cpu, Zap, Clock, BookOpen } from 'lucide-react';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { ModelCard } from '@/components/ModelCard';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ModelsGridSkeleton, QuickStatsSkeleton } from '@/components/skeletons';

export const ModelsView = () => {
  const [models, setModels] = useState<CuratedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'provider'>('provider');

  usePageMeta({
    title: 'Compare AI Models for Debates',
    description: 'Explore our curated selection of AI models from Meta, Google, DeepSeek, and more. Learn about each model\'s strengths, speed, and ideal use cases.',
    canonicalPath: '/models',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Models', path: '/models' },
    ],
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await getEnabledModels();
        setModels(data);
      } catch (error) {
        console.error('Error loading models:', error);
      } finally {
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  const providers = [...new Set(models.map(m => m.provider))];

  const filteredModels = models
    .filter(m => {
      const matchesSearch = m.display_name.toLowerCase().includes(search.toLowerCase()) ||
        m.model_id.toLowerCase().includes(search.toLowerCase());
      const matchesProvider = providerFilter === 'all' || m.provider === providerFilter;
      return matchesSearch && matchesProvider;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.display_name.localeCompare(b.display_name);
      return a.provider.localeCompare(b.provider) || a.display_name.localeCompare(b.display_name);
    });

  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, CuratedModel[]>);

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Models</h1>
          </div>
          <Link to="/new">
            <Button>Try Models Now</Button>
          </Link>
        </div>
        <p className="text-muted-foreground">
          Explore our curated selection of AI models. Learn about each model's strengths, 
          weaknesses, and ideal use cases to make informed choices for your conversations.
        </p>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <QuickStatsSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{models.length}</div>
            <div className="text-sm text-muted-foreground">Available Models</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{providers.length}</div>
            <div className="text-sm text-muted-foreground">Providers</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{models.filter(m => m.is_free).length}</div>
            <div className="text-sm text-muted-foreground">Free Models</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map(provider => (
                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortBy(sortBy === 'name' ? 'provider' : 'name')}
            title={`Sort by ${sortBy === 'name' ? 'provider' : 'name'}`}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-green-500" />
          <span>Fast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-yellow-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-orange-500" />
          <span>Slow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-xs">FREE</Badge>
          <span>No cost</span>
        </div>
      </div>

      {/* Models List */}
      {loading ? (
        <ModelsGridSkeleton />
      ) : filteredModels.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No models found matching your criteria
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedModels).map(([provider, providerModels]) => (
            <div key={provider} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {provider}
                <Badge variant="outline" className="text-xs font-normal">
                  {providerModels.length} models
                </Badge>
              </h2>
              <div className="space-y-3">
                {providerModels.map(model => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <Card className="p-6 bg-muted/30">
        <div className="flex items-start gap-4">
          <BookOpen className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold">Powered by OpenRouter</h3>
            <p className="text-sm text-muted-foreground">
              SiliconSoap uses OpenRouter to provide unified access to 300+ AI models from leading providers.
              Models are carefully curated to ensure quality and reliability.
            </p>
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Learn more about OpenRouter <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

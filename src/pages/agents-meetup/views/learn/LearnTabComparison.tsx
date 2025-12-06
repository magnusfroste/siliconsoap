import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Search, ArrowUpDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';

export const LearnTabComparison = () => {
  const [models, setModels] = useState<CuratedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'provider'>('provider');

  useEffect(() => {
    const loadModels = async () => {
      try {
        const data = await getEnabledModels();
        setModels(data);
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  // Get unique providers
  const providers = Array.from(new Set(models.map(m => m.provider))).sort();

  // Filter and sort models
  const filteredModels = models
    .filter(model => {
      const matchesSearch = 
        model.display_name.toLowerCase().includes(search.toLowerCase()) ||
        model.provider.toLowerCase().includes(search.toLowerCase()) ||
        model.model_id.toLowerCase().includes(search.toLowerCase());
      const matchesProvider = providerFilter === 'all' || model.provider === providerFilter;
      return matchesSearch && matchesProvider;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.display_name.localeCompare(b.display_name);
      }
      return a.provider.localeCompare(b.provider) || a.display_name.localeCompare(b.display_name);
    });

  // Group by provider for display
  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, CuratedModel[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Available Models
          </h2>
          <p className="text-sm text-muted-foreground">
            {models.length} models available on SiliconSoap
          </p>
        </div>
        
        <Link to="/new">
          <Button>
            Try Models Now
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading models...
        </div>
      )}

      {/* Models List */}
      {!loading && Object.keys(groupedModels).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No models found matching your criteria
          </CardContent>
        </Card>
      )}

      {!loading && Object.entries(groupedModels).map(([provider, providerModels]) => (
        <Card key={provider}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{provider}</CardTitle>
            <CardDescription>{providerModels.length} model{providerModels.length > 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {providerModels.map((model) => (
                <div 
                  key={model.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{model.display_name}</span>
                      {model.is_free && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          FREE
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {model.model_id}
                    </div>
                  </div>
                  
                  <Link to="/new">
                    <Button variant="ghost" size="sm">
                      Try
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Credits */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-medium mb-1">Powered by OpenRouter</h3>
              <p className="text-sm text-muted-foreground">
                Unified API access to 300+ models from leading providers
              </p>
            </div>
            <a 
              href="https://openrouter.ai/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
            >
              Learn more about OpenRouter
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

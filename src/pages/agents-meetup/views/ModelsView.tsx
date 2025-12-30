import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, ExternalLink, Cpu, Zap, Clock, BookOpen, Server, Cloud, Shield, DollarSign } from 'lucide-react';
import { getEnabledModels, CuratedModel } from '@/repositories/curatedModelsRepository';
import { ModelCard } from '@/components/ModelCard';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ModelsGridSkeleton, QuickStatsSkeleton } from '@/components/skeletons';

// Price tier display config
const PRICE_TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'FREE', color: 'text-green-600' },
  budget: { label: '$', color: 'text-blue-600' },
  standard: { label: '$$', color: 'text-amber-600' },
  premium: { label: '$$$', color: 'text-orange-600' },
  elite: { label: '$$$$', color: 'text-red-600' },
};

export const ModelsView = () => {
  const [models, setModels] = useState<CuratedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [licenseFilter, setLicenseFilter] = useState<string>('all');
  const [priceTierFilter, setPriceTierFilter] = useState<string>('all');
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

  const openWeightCount = models.filter(m => m.license_type === 'open-weight').length;
  
  // Count models by price tier
  const priceTierCounts = models.reduce((acc, m) => {
    const tier = m.price_tier || 'unknown';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredModels = models
    .filter(m => {
      const matchesSearch = m.display_name.toLowerCase().includes(search.toLowerCase()) ||
        m.model_id.toLowerCase().includes(search.toLowerCase());
      const matchesProvider = providerFilter === 'all' || m.provider === providerFilter;
      const matchesLicense = licenseFilter === 'all' || m.license_type === licenseFilter;
      const matchesPriceTier = priceTierFilter === 'all' || 
        (priceTierFilter === 'budget-friendly' && (m.price_tier === 'free' || m.price_tier === 'budget')) ||
        (priceTierFilter === 'premium-plus' && (m.price_tier === 'premium' || m.price_tier === 'elite')) ||
        m.price_tier === priceTierFilter;
      return matchesSearch && matchesProvider && matchesLicense && matchesPriceTier;
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{models.length}</div>
            <div className="text-sm text-muted-foreground">Available Models</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{priceTierCounts.free || 0}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              Free Models
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{(priceTierCounts.budget || 0) + (priceTierCounts.standard || 0)}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              Budget/Standard
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{(priceTierCounts.premium || 0) + (priceTierCounts.elite || 0)}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              Premium+
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{openWeightCount}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Server className="h-3 w-3" />
              Open-Weight
            </div>
          </Card>
        </div>
      )}

      {/* Open-Weight Education Banner */}
      <Card className="p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Shield className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
              Privacy-First AI with Open-Weight Models
            </h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-emerald-600">Open-weight models</span> can be downloaded and run on your own hardware — 
              giving you complete control over your data. No API calls, no cloud dependency, full privacy.
              Perfect for sensitive applications, air-gapped environments, or reducing costs at scale.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="https://huggingface.co/models"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Browse models on Hugging Face <ExternalLink className="h-3 w-3" />
              </a>
              <Link
                to="/learn?tab=open-weight"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Learn about open-weight models →
              </Link>
            </div>
          </div>
        </div>
      </Card>

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
          <Select value={priceTierFilter} onValueChange={setPriceTierFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="budget-friendly">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  Free & Budget
                </span>
              </SelectItem>
              <SelectItem value="standard">
                <span className="flex items-center gap-2">
                  <span className="text-amber-600 font-bold text-xs">$$</span>
                  Standard
                </span>
              </SelectItem>
              <SelectItem value="premium-plus">
                <span className="flex items-center gap-2">
                  <span className="text-orange-600 font-bold text-xs">$$$+</span>
                  Premium+
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={licenseFilter} onValueChange={setLicenseFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="open-weight">
                <span className="flex items-center gap-2">
                  <Server className="h-3.5 w-3.5 text-emerald-600" />
                  Open-Weight
                </span>
              </SelectItem>
              <SelectItem value="closed">
                <span className="flex items-center gap-2">
                  <Cloud className="h-3.5 w-3.5 text-sky-600" />
                  Cloud-Only
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-full sm:w-40">
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
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20 font-bold">FREE</Badge>
          <span>Free</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold">$</Badge>
          <span>Budget</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">$$</Badge>
          <span>Standard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20 font-bold">$$$</Badge>
          <span>Premium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20 font-bold">$$$$</Badge>
          <span>Elite</span>
        </div>
        <div className="border-l border-border pl-4 flex items-center gap-1.5">
          <Server className="h-4 w-4 text-emerald-600" />
          <span>Open-Weight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cloud className="h-4 w-4 text-sky-600" />
          <span>Cloud-Only</span>
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

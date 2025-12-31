import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Server, BookText, Users, Shield } from 'lucide-react';
import { LearnTabModels } from './learn/LearnTabModels';
import { LearnTabPrivacy } from './learn/LearnTabPrivacy';
import { LearnTabSelfHosting } from './learn/LearnTabSelfHosting';
import { LearnTabAgents } from './learn/LearnTabAgents';
import { LearnTabGlossary } from './learn/LearnTabGlossary';
import { usePageMeta } from '@/hooks/usePageMeta';

const VALID_TABS = ['models', 'privacy', 'local', 'agents', 'glossary'];

export const LearnView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'models';

  usePageMeta({
    title: 'AI Crash Course - Learn About AI Models',
    description: 'Learn AI model fundamentals, the difference between cloud and private AI, how to run models locally, and the future of multi-agent systems.',
    canonicalPath: '/learn',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Learn', path: '/learn' },
    ],
  });

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI Crash Course</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Understanding AI Models
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From the basics to the future of AI agents — everything you need to know in one place
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full flex flex-wrap justify-center gap-1 h-auto p-1 mb-8">
          <TabsTrigger value="models" className="flex items-center gap-2 px-4 py-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Models 101</span>
            <span className="sm:hidden">Models</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2 px-4 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Cloud vs Private</span>
            <span className="sm:hidden">Private</span>
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2 px-4 py-2">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">Run Locally</span>
            <span className="sm:hidden">Local</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2 px-4 py-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">AI Agents</span>
            <span className="sm:hidden">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex items-center gap-2 px-4 py-2">
            <BookText className="h-4 w-4" />
            <span className="hidden sm:inline">Glossary</span>
            <span className="sm:hidden">Terms</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <LearnTabModels />
        </TabsContent>
        <TabsContent value="privacy">
          <LearnTabPrivacy />
        </TabsContent>
        <TabsContent value="local">
          <LearnTabSelfHosting />
        </TabsContent>
        <TabsContent value="agents">
          <LearnTabAgents />
        </TabsContent>
        <TabsContent value="glossary">
          <LearnTabGlossary />
        </TabsContent>
      </Tabs>

      {/* Credits Footer */}
      <div className="mt-12 pt-8 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-4">Powered by the open-source AI ecosystem</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a 
              href="https://openrouter.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <span className="font-medium">OpenRouter</span>
              <span className="text-xs">— Unified API for 300+ models</span>
            </a>
            <a 
              href="https://huggingface.co" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <span className="font-medium">Hugging Face</span>
              <span className="text-xs">— Download & deploy models</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

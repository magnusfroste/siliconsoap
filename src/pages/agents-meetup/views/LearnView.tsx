import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Server, BookText, Users, Shield } from 'lucide-react';
import { LearnTabModels } from './learn/LearnTabModels';
import { LearnTabPrivacy } from './learn/LearnTabPrivacy';
import { LearnTabSelfHosting } from './learn/LearnTabSelfHosting';
import { LearnTabAgents } from './learn/LearnTabAgents';
import { LearnTabGlossary } from './learn/LearnTabGlossary';
import { LearnAgentBlocks } from '@/components/learn/LearnAgentBlocks';
import { PageHeader } from '@/components/editorial/PageHeader';
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
    <div className="learn-editorial max-w-5xl mx-auto py-8 px-4 md:py-12 md:px-8">
      <PageHeader eyebrow="AI Crash Course" title="Understanding AI models." lead="From the basics to the future of AI agents — everything you need to know in one place." />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex w-fit max-w-full flex-wrap justify-start gap-1 h-auto rounded-lg p-1 mb-8 bg-muted">
          <TabsTrigger value="models" className="flex min-h-11 items-center gap-2 px-3 py-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Models 101</span>
            <span className="sm:hidden">Models</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex min-h-11 items-center gap-2 px-3 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Cloud vs Private</span>
            <span className="sm:hidden">Private</span>
          </TabsTrigger>
          <TabsTrigger value="local" className="flex min-h-11 items-center gap-2 px-3 py-2">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">Run Locally</span>
            <span className="sm:hidden">Local</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex min-h-11 items-center gap-2 px-3 py-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">AI Agents</span>
            <span className="sm:hidden">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex min-h-11 items-center gap-2 px-3 py-2">
            <BookText className="h-4 w-4" />
            <span className="hidden sm:inline">Glossary</span>
            <span className="sm:hidden">Terms</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <LearnAgentBlocks tab="models" />
          <LearnTabModels />
        </TabsContent>
        <TabsContent value="privacy">
          <LearnAgentBlocks tab="privacy" />
          <LearnTabPrivacy />
        </TabsContent>
        <TabsContent value="local">
          <LearnAgentBlocks tab="local" />
          <LearnTabSelfHosting />
        </TabsContent>
        <TabsContent value="agents">
          <LearnAgentBlocks tab="agents" />
          <LearnTabAgents />
        </TabsContent>
        <TabsContent value="glossary">
          <LearnAgentBlocks tab="glossary" />
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

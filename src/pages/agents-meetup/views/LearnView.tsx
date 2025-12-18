import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Cpu, Scale, Server, BookText } from 'lucide-react';
import { LearnTabBasics } from './learn/LearnTabBasics';
import { LearnTabTypes } from './learn/LearnTabTypes';
import { LearnTabOpenWeight } from './learn/LearnTabOpenWeight';
import { LearnTabSelfHosting } from './learn/LearnTabSelfHosting';
import { LearnTabGlossary } from './learn/LearnTabGlossary';
import { usePageMeta } from '@/hooks/usePageMeta';

const VALID_TABS = ['basics', 'types', 'open-weight', 'self-hosting', 'glossary'];

export const LearnView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'basics';

  usePageMeta({
    title: 'Learn About AI Models - Llama, DeepSeek, Gemma',
    description: 'Master AI model fundamentals. Learn about instruct vs reasoning models, open-weight advantages, and how to self-host AI with LM Studio and Ollama.',
    canonicalPath: '/learn',
  });

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Learn Center</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Understanding AI Models
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master the fundamentals of AI models, compare architectures, and learn how to run models locally
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full flex flex-wrap justify-center gap-1 h-auto p-1 mb-8">
          <TabsTrigger value="basics" className="flex items-center gap-2 px-4 py-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Model Basics</span>
            <span className="sm:hidden">Basics</span>
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2 px-4 py-2">
            <Cpu className="h-4 w-4" />
            <span className="hidden sm:inline">Instruct vs Reasoning</span>
            <span className="sm:hidden">Types</span>
          </TabsTrigger>
          <TabsTrigger value="open-weight" className="flex items-center gap-2 px-4 py-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Open-Weight</span>
            <span className="sm:hidden">Open</span>
          </TabsTrigger>
          <TabsTrigger value="self-hosting" className="flex items-center gap-2 px-4 py-2">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">Self-Hosting</span>
            <span className="sm:hidden">Hosting</span>
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex items-center gap-2 px-4 py-2">
            <BookText className="h-4 w-4" />
            <span className="hidden sm:inline">Glossary</span>
            <span className="sm:hidden">Terms</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <LearnTabBasics />
        </TabsContent>
        <TabsContent value="types">
          <LearnTabTypes />
        </TabsContent>
        <TabsContent value="open-weight">
          <LearnTabOpenWeight />
        </TabsContent>
        <TabsContent value="self-hosting">
          <LearnTabSelfHosting />
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

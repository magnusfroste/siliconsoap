import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HotTopic {
  id: string;
  topic: string;
  prompt: string;
  targetDate: string;
  models: string[];
  personas: string[];
}

const HOT_TOPICS_2025: HotTopic[] = [
  {
    id: '1',
    topic: 'Will AGI arrive within 5 years?',
    prompt: 'Debate whether Artificial General Intelligence will be achieved by 2030. Consider current AI capabilities, research trajectories, and the fundamental challenges that remain.',
    targetDate: '2025-01-15',
    models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'meta-llama/llama-3.1-70b-instruct'],
    personas: ['Tech Optimist', 'Skeptical Researcher', 'Pragmatic Engineer']
  },
  {
    id: '2',
    topic: 'EU AI Act: Good or bad for innovation?',
    prompt: 'Discuss whether the EU AI Act will help or hinder AI innovation in Europe. Consider safety benefits, compliance costs, and global competitiveness.',
    targetDate: '2025-02-12',
    models: ['mistralai/mistral-large', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o'],
    personas: ['EU Policy Advocate', 'Startup Founder', 'AI Safety Researcher']
  },
  {
    id: '3',
    topic: 'Should AI-generated art be protected by copyright?',
    prompt: 'Debate whether AI-generated artwork deserves copyright protection. Consider the role of human creativity, training data rights, and economic implications for artists.',
    targetDate: '2025-03-18',
    models: ['anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-70b-instruct', 'google/gemini-pro-1.5'],
    personas: ['Digital Artist', 'IP Lawyer', 'AI Researcher']
  },
  {
    id: '4',
    topic: 'Will AI replace programmers?',
    prompt: 'Discuss whether AI coding assistants will eventually replace human programmers. Consider current capabilities, the nature of software development, and the evolution of the profession.',
    targetDate: '2025-04-22',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'qwen/qwen-2.5-72b-instruct'],
    personas: ['Senior Developer', 'AI Enthusiast', 'Tech Lead']
  },
  {
    id: '5',
    topic: 'Open-source AI vs closed models - which is safer?',
    prompt: 'Debate whether open-source AI models are safer than closed proprietary models. Consider transparency, misuse potential, and collective improvement.',
    targetDate: '2025-05-08',
    models: ['meta-llama/llama-3.1-70b-instruct', 'anthropic/claude-3.5-sonnet', 'mistralai/mistral-large'],
    personas: ['Open Source Advocate', 'Corporate AI Lead', 'Security Expert']
  },
  {
    id: '6',
    topic: 'AI in schools: Cheating tool or future of education?',
    prompt: 'Discuss whether AI tools in education represent a threat to learning or an opportunity to transform education. Consider critical thinking, accessibility, and pedagogical approaches.',
    targetDate: '2025-06-05',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5'],
    personas: ['High School Teacher', 'EdTech Entrepreneur', 'Education Researcher']
  },
  {
    id: '7',
    topic: 'Can AI solve the climate crisis?',
    prompt: 'Debate whether AI can be a significant force in addressing climate change. Consider energy optimization, scientific discovery, and the carbon footprint of AI itself.',
    targetDate: '2025-07-14',
    models: ['anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-70b-instruct', 'openai/gpt-4o'],
    personas: ['Climate Scientist', 'AI Researcher', 'Environmental Activist']
  },
  {
    id: '8',
    topic: 'Should AI models be regulated like pharmaceuticals?',
    prompt: 'Discuss whether AI systems should undergo rigorous testing and approval processes similar to drug regulation. Consider safety, innovation speed, and enforcement challenges.',
    targetDate: '2025-08-20',
    models: ['mistralai/mistral-large', 'anthropic/claude-3.5-sonnet', 'qwen/qwen-2.5-72b-instruct'],
    personas: ['Regulatory Expert', 'AI Startup CEO', 'Bioethicist']
  },
  {
    id: '9',
    topic: 'Deepfakes and democracy: The invisible threat',
    prompt: 'Debate how deepfakes and AI-generated misinformation threaten democratic processes. Consider detection technology, media literacy, and regulatory responses.',
    targetDate: '2025-09-10',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-70b-instruct'],
    personas: ['Journalist', 'AI Ethics Researcher', 'Political Scientist']
  },
  {
    id: '10',
    topic: 'Who owns the data that trains AI?',
    prompt: 'Discuss data ownership and consent in AI training. Consider creator rights, fair compensation, and the balance between innovation and intellectual property.',
    targetDate: '2025-10-07',
    models: ['anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5', 'meta-llama/llama-3.1-70b-instruct'],
    personas: ['Content Creator', 'Tech Lawyer', 'AI Company Representative']
  },
  {
    id: '11',
    topic: 'AI assistants: Friend or foe?',
    prompt: 'Debate whether AI personal assistants are beneficial or harmful to human autonomy and wellbeing. Consider productivity, privacy, dependency, and social skills.',
    targetDate: '2025-11-15',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'mistralai/mistral-large'],
    personas: ['Psychologist', 'Tech Executive', 'Digital Minimalist']
  },
  {
    id: '12',
    topic: 'The biggest AI breakthroughs of 2025',
    prompt: 'Discuss what the most significant AI advancements of 2025 have been and their implications for the future. Consider technical progress, societal impact, and unexpected developments.',
    targetDate: '2025-12-20',
    models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-pro-1.5'],
    personas: ['AI Researcher', 'Tech Journalist', 'Venture Capitalist']
  }
];

interface SeedResult {
  topicId: string;
  success: boolean;
  shareId?: string;
  error?: string;
}

export const SeedingTab = () => {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [results, setResults] = useState<SeedResult[]>([]);

  const toggleTopic = (id: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTopics(newSelected);
  };

  const selectAll = () => {
    if (selectedTopics.size === HOT_TOPICS_2025.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(HOT_TOPICS_2025.map(t => t.id)));
    }
  };

  const seedDebates = async () => {
    if (selectedTopics.size === 0) {
      toast.error('Please select at least one topic');
      return;
    }

    setIsSeeding(true);
    setProgress(0);
    setResults([]);

    const topicsToSeed = HOT_TOPICS_2025.filter(t => selectedTopics.has(t.id));
    const newResults: SeedResult[] = [];

    for (let i = 0; i < topicsToSeed.length; i++) {
      const topic = topicsToSeed[i];
      setCurrentTopic(topic.topic);
      setProgress(((i) / topicsToSeed.length) * 100);

      try {
        const agents = topic.models.map((model, idx) => ({
          name: `${topic.personas[idx]}`,
          model,
          persona: topic.personas[idx],
          personaInstructions: `You embody the perspective of a ${topic.personas[idx]}. Argue from this viewpoint with conviction but remain open to good counter-arguments.`
        }));

        const { data, error } = await supabase.functions.invoke('seed-debates', {
          body: {
            topic: topic.topic,
            prompt: topic.prompt,
            targetDate: topic.targetDate,
            agents,
            viewCountMin: 50,
            viewCountMax: 500,
            reactionCount: Math.floor(Math.random() * 30) + 20, // 20-50 reactions
            scenarioId: 'debate'
          }
        });

        if (error) throw error;

        if (data.success) {
          newResults.push({ topicId: topic.id, success: true, shareId: data.shareId });
          toast.success(`Seeded: ${topic.topic}`);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (error) {
        console.error(`Error seeding ${topic.topic}:`, error);
        newResults.push({ 
          topicId: topic.id, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        toast.error(`Failed: ${topic.topic}`);
      }

      setResults([...newResults]);

      // Delay between debates to avoid rate limiting
      if (i < topicsToSeed.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    setProgress(100);
    setCurrentTopic(null);
    setIsSeeding(false);
    
    const successCount = newResults.filter(r => r.success).length;
    toast.success(`Seeding complete: ${successCount}/${topicsToSeed.length} debates created`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Seed Featured Debates
              </CardTitle>
              <CardDescription>
                Generate real AI debates with backdated timestamps, views, and reactions for 2025 hot topics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={selectAll} disabled={isSeeding}>
                {selectedTopics.size === HOT_TOPICS_2025.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button onClick={seedDebates} disabled={isSeeding || selectedTopics.size === 0}>
                {isSeeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Seed Selected ({selectedTopics.size})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isSeeding && (
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currentTopic || 'Preparing...'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="space-y-3">
            {HOT_TOPICS_2025.map((topic) => {
              const result = results.find(r => r.topicId === topic.id);
              
              return (
                <div
                  key={topic.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                    selectedTopics.has(topic.id) ? 'bg-primary/5 border-primary/30' : 'bg-card'
                  }`}
                >
                  <Checkbox
                    checked={selectedTopics.has(topic.id)}
                    onCheckedChange={() => toggleTopic(topic.id)}
                    disabled={isSeeding}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{topic.topic}</span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(topic.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Badge>
                      {result && (
                        result.success ? (
                          <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Seeded
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {topic.prompt}
                    </p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {topic.personas.map((persona, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {persona}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seeding Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result) => {
                const topic = HOT_TOPICS_2025.find(t => t.id === result.topicId);
                return (
                  <div key={result.topicId} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">{topic?.topic}</span>
                    {result.success ? (
                      <a 
                        href={`/share/${result.shareId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View →
                      </a>
                    ) : (
                      <span className="text-sm text-destructive">{result.error}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, Network, Target, ArrowRight, 
  GitBranch, MessageSquare, Shield, Sparkles, 
  Code, Search, FileText, Headphones,
  Zap, CheckCircle2, AlertTriangle, Brain, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearnTabAgents = () => {
  const orchestrationPatterns = [
    {
      name: 'Sequential Pipeline',
      icon: <GitBranch className="h-5 w-5" />,
      description: 'Agents work in order, each building on the previous output',
      example: 'Researcher → Writer → Editor → Publisher',
    },
    {
      name: 'Parallel Ensemble',
      icon: <Network className="h-5 w-5" />,
      description: 'Multiple agents work simultaneously, outputs are merged',
      example: '3 analysts review data, synthesizer combines insights',
    },
    {
      name: 'Debate & Critique',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Agents challenge each other to refine ideas',
      example: 'Proposer vs Critic vs Judge iterating until consensus',
    },
    {
      name: 'Hierarchical Delegation',
      icon: <Target className="h-5 w-5" />,
      description: 'Manager agent delegates tasks to specialist workers',
      example: 'PM agent assigns tasks to coder, designer, tester',
    },
  ];

  const realUseCases = [
    {
      domain: 'Software Development',
      icon: <Code className="h-6 w-6" />,
      agents: ['Architect', 'Coder', 'Reviewer', 'Tester'],
      description: 'Agents collaborate to design, implement, review, and deploy code.',
    },
    {
      domain: 'Research & Analysis',
      icon: <Search className="h-6 w-6" />,
      agents: ['Searcher', 'Summarizer', 'Critic', 'Synthesizer'],
      description: 'One agent gathers sources, another summarizes, the critic questions.',
    },
    {
      domain: 'Content Creation',
      icon: <FileText className="h-6 w-6" />,
      agents: ['Ideator', 'Writer', 'Editor', 'Fact-Checker'],
      description: 'Creative and analytical agents work together.',
    },
    {
      domain: 'Customer Support',
      icon: <Headphones className="h-6 w-6" />,
      agents: ['Classifier', 'Specialist', 'Escalator', 'QA'],
      description: 'First agent classifies the issue, routes to specialists.',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">The Future of AI</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">Multi-Agent AI & Swarms</h2>
        <p className="text-muted-foreground">
          Instead of one massive model doing everything, the future is specialized agents 
          collaborating — like a team of experts, each with their unique strengths.
        </p>
      </div>

      {/* Why Multi-Agent */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Why Multi-Agent?
          </CardTitle>
          <CardDescription>
            The limitations of monolithic models and the advantages of collaboration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Problems with Single Models */}
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Single Model Limitations
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">×</span>
                  <span>Jack of all trades, master of none</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">×</span>
                  <span>Scaling costs explode exponentially</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">×</span>
                  <span>No built-in error checking or debate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">×</span>
                  <span>Opaque reasoning — hard to debug</span>
                </li>
              </ul>
            </div>

            {/* Multi-Agent Benefits */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Multi-Agent Advantages
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Specialized experts for each task</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Smaller, cheaper models = lower cost</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Built-in review and error correction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Transparent reasoning per agent</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orchestration Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Orchestration Patterns
          </CardTitle>
          <CardDescription>
            Common patterns for coordinating agent workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {orchestrationPatterns.map((pattern) => (
              <div key={pattern.name} className="p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-primary/10 text-primary">
                    {pattern.icon}
                  </div>
                  <h4 className="font-semibold">{pattern.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {pattern.description}
                </p>
                <div className="text-xs font-mono bg-background/50 p-2 rounded">
                  {pattern.example}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Real-World Use Cases
          </CardTitle>
          <CardDescription>
            How organizations are using multi-agent systems today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {realUseCases.map((useCase) => (
              <div key={useCase.domain} className="p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    {useCase.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-1">{useCase.domain}</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {useCase.agents.map((agent) => (
                        <Badge key={agent} variant="secondary" className="text-xs">
                          {agent}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Tech: RAG, CAG, Enterprise AI */}
      <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-secondary" />
            What's Coming Next?
          </CardTitle>
          <CardDescription>
            Techniques that extend what AI agents can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <Database className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">RAG</h4>
              <p className="text-sm text-muted-foreground">
                Retrieval-Augmented Generation — connecting models to external knowledge bases in real-time
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <Zap className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">CAG</h4>
              <p className="text-sm text-muted-foreground">
                Cache-Augmented Generation — intelligent caching for faster, more efficient responses
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <Brain className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">Enterprise AI</h4>
              <p className="text-sm text-muted-foreground">
                Soon, entire enterprise systems can reside inside an LLM — without retraining for each transaction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why Open-Weight for Multi-Agent */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Why Open-Weight for Multi-Agent?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Fine-Tune Each Agent</h4>
                <p className="text-sm text-muted-foreground">
                  Specialize each agent for its role — a critic trained to find flaws.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Run Privately</h4>
                <p className="text-sm text-muted-foreground">
                  Sensitive data stays in your infrastructure. No API calls leaking information.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Lower Cost</h4>
                <p className="text-sm text-muted-foreground">
                  Smaller specialized models are cheaper. Run many agents in parallel.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Swap Components</h4>
                <p className="text-sm text-muted-foreground">
                  Upgrade one agent without retraining the whole system. No vendor lock-in.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SiliconSoap CTA */}
      <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 border-primary/30">
        <CardContent className="pt-6">
          <div className="text-center max-w-xl mx-auto">
            <div className="p-3 rounded-full bg-primary/20 w-fit mx-auto mb-4">
              <Network className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              Experience Multi-Agent Dynamics
            </h3>
            <p className="text-muted-foreground mb-6">
              SiliconSoap lets you watch how different AI models debate, challenge, 
              and collaborate. Understand their personalities before deploying them 
              in your own agent systems.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/new">
                <Button className="gap-2">
                  Start a Multi-Agent Debate
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" className="gap-2">
                  Browse Conversations
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

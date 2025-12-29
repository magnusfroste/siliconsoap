import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, Network, Target, Layers, ArrowRight, 
  GitBranch, MessageSquare, Shield, Sparkles, 
  Code, Search, FileText, Headphones, Bot,
  Zap, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearnTabMultiAgent = () => {
  const orchestrationPatterns = [
    {
      name: 'Sequential Pipeline',
      icon: <GitBranch className="h-5 w-5" />,
      description: 'Agents work in order, each building on the previous output',
      example: 'Researcher → Writer → Editor → Publisher',
      pros: ['Simple to debug', 'Clear data flow'],
      cons: ['Slow (no parallelism)', 'Single point of failure'],
    },
    {
      name: 'Parallel Ensemble',
      icon: <Layers className="h-5 w-5" />,
      description: 'Multiple agents work simultaneously, outputs are merged',
      example: '3 analysts review data independently, synthesizer combines insights',
      pros: ['Fast', 'Diverse perspectives'],
      cons: ['Needs merge logic', 'Higher compute cost'],
    },
    {
      name: 'Debate & Critique',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Agents challenge each other to refine ideas',
      example: 'Proposer vs Critic vs Judge iterating until consensus',
      pros: ['Higher quality output', 'Catches errors'],
      cons: ['More iterations', 'Can get stuck'],
    },
    {
      name: 'Hierarchical Delegation',
      icon: <Network className="h-5 w-5" />,
      description: 'Manager agent delegates tasks to specialist workers',
      example: 'PM agent assigns tasks to coder, designer, tester agents',
      pros: ['Scales well', 'Clear responsibilities'],
      cons: ['Complex orchestration', 'Manager is bottleneck'],
    },
  ];

  const realUseCases = [
    {
      domain: 'Software Development',
      icon: <Code className="h-6 w-6" />,
      agents: ['Architect', 'Coder', 'Reviewer', 'Tester', 'DevOps'],
      description: 'Agents collaborate to design, implement, review, and deploy code. The reviewer catches bugs the coder missed, the tester validates edge cases.',
      benefit: 'Faster development with fewer bugs reaching production',
    },
    {
      domain: 'Research & Analysis',
      icon: <Search className="h-6 w-6" />,
      agents: ['Searcher', 'Summarizer', 'Critic', 'Synthesizer'],
      description: 'One agent gathers sources, another summarizes, a critic questions assumptions, and a synthesizer creates the final report.',
      benefit: 'More thorough research with built-in fact-checking',
    },
    {
      domain: 'Content Creation',
      icon: <FileText className="h-6 w-6" />,
      agents: ['Ideator', 'Writer', 'Editor', 'SEO Optimizer', 'Fact-Checker'],
      description: 'Creative and analytical agents work together—ideation is separated from editing, allowing each to excel at their specialty.',
      benefit: 'Higher quality content with consistent style and accuracy',
    },
    {
      domain: 'Customer Support',
      icon: <Headphones className="h-6 w-6" />,
      agents: ['Classifier', 'Specialist', 'Escalator', 'QA'],
      description: 'First agent classifies the issue, routes to specialist agents (billing, tech, etc.), escalator handles edge cases, QA checks response quality.',
      benefit: 'Faster resolution with specialized expertise per domain',
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
        <h2 className="text-2xl font-bold mb-3">Multi-Agent AI Systems</h2>
        <p className="text-muted-foreground">
          Instead of one massive model doing everything, the future is specialized agents 
          collaborating—like a team of experts, each bringing their unique strengths.
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
                  <span>Single point of failure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">×</span>
                  <span>Opaque reasoning—hard to debug</span>
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
                  <span>Graceful degradation if one fails</span>
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

      {/* Swarm Architectures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Swarm Architectures
          </CardTitle>
          <CardDescription>
            How agents organize and communicate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold">Centralized</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                One orchestrator agent controls all workers. Simple but creates a bottleneck.
              </p>
              <div className="text-xs font-mono bg-background/50 p-2 rounded">
                Orchestrator → [Agent A, B, C]
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-primary/10">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold">Hierarchical</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Managers delegate to sub-managers who control workers. Scales to large systems.
              </p>
              <div className="text-xs font-mono bg-background/50 p-2 rounded">
                CEO → [Manager A, B] → [Workers]
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold">Peer-to-Peer</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Agents communicate directly with each other. Decentralized, emergent behavior.
              </p>
              <div className="text-xs font-mono bg-background/50 p-2 rounded">
                A ↔ B ↔ C ↔ D ↔ A
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold">Blackboard</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Shared workspace where agents read/write. Good for collaborative problem-solving.
              </p>
              <div className="text-xs font-mono bg-background/50 p-2 rounded">
                [Agents] ↔ Shared State ↔ [Agents]
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-primary/10">
                  <GitBranch className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold">Pipeline</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Data flows through a sequence of agents. Each transforms and passes forward.
              </p>
              <div className="text-xs font-mono bg-background/50 p-2 rounded">
                Input → A → B → C → Output
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold">Mixture of Experts</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Router sends each input to the most relevant expert. Efficient specialization.
              </p>
              <div className="text-xs font-mono bg-background/50 p-2 rounded">
                Input → Router → Expert[i] → Output
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orchestration Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Orchestration Patterns
          </CardTitle>
          <CardDescription>
            Common patterns for coordinating agent workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {orchestrationPatterns.map((pattern) => (
              <div key={pattern.name} className="p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-primary/10 text-primary">
                    {pattern.icon}
                  </div>
                  <h4 className="font-semibold">{pattern.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {pattern.description}
                </p>
                <div className="text-xs font-mono bg-background/50 p-2 rounded mb-3">
                  {pattern.example}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-medium text-primary mb-1">Pros</div>
                    <ul className="text-muted-foreground space-y-0.5">
                      {pattern.pros.map((pro, i) => (
                        <li key={i}>+ {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-destructive mb-1">Cons</div>
                    <ul className="text-muted-foreground space-y-0.5">
                      {pattern.cons.map((con, i) => (
                        <li key={i}>- {con}</li>
                      ))}
                    </ul>
                  </div>
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
            How organizations are deploying multi-agent systems today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {realUseCases.map((useCase) => (
              <div key={useCase.domain} className="p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-start gap-4">
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
                    <p className="text-sm text-muted-foreground mb-2">
                      {useCase.description}
                    </p>
                    <div className="text-xs bg-primary/10 text-primary p-2 rounded inline-block">
                      <strong>Result:</strong> {useCase.benefit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Communication */}
      <Card className="bg-gradient-to-br from-secondary/10 to-background border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-secondary" />
            Agent Communication Protocols
          </CardTitle>
          <CardDescription>
            How agents share information and coordinate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border">
              <h4 className="font-semibold mb-2">Message Passing</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Agents send structured messages to each other. Clear contracts, easy to log.
              </p>
              <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                {`{from: "Researcher", to: "Writer", type: "data", content: {...}}`}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <h4 className="font-semibold mb-2">Shared Memory</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Agents read/write to a common state. Good for collaborative building.
              </p>
              <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                {`state.findings.push(newInsight)`}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <h4 className="font-semibold mb-2">Tool Calling</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Agents invoke each other as tools. The orchestrator decides who to call.
              </p>
              <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                {`call_agent("FactChecker", {claim: "..."})`}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <h4 className="font-semibold mb-2">Event Broadcasting</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Agents publish events, others subscribe. Loose coupling, scales well.
              </p>
              <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                {`emit("draft_complete", {doc: ...})`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open-Weight Advantage */}
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
                  Specialize each agent for its role—a critic trained to find flaws, 
                  a writer trained on your style guide.
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
                  Sensitive data stays in your infrastructure. No API calls leaking 
                  proprietary information.
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
                  Smaller specialized models are cheaper than one giant API call. 
                  Run many agents in parallel affordably.
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
                  Upgrade one agent without retraining the whole system. 
                  No vendor lock-in.
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
              in your own agent swarms.
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
                  Browse Agent Conversations
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
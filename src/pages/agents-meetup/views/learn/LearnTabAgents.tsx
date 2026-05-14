import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, Network, Target, ArrowRight, 
  GitBranch, MessageSquare, Shield, Sparkles, 
  Code, Search, FileText, Headphones,
  Zap, CheckCircle2, AlertTriangle, Brain, Database,
  ExternalLink, Rocket,
  Building2, Globe, Server,
  HelpCircle, ChevronDown
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

      {/* Real Open-Source Agents in the Wild */}
      <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Open-Source Agents in the Wild
          </CardTitle>
          <CardDescription>
            The theory above is no longer theory — these autonomous agents are being run on real servers, today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A new wave of <strong>open-source autonomous agents</strong> emerged in late 2025 / early 2026.
            Unlike chatbots, these run as background services with real credentials, persistent memory and
            the ability to act on your behalf — locally or on your own server.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* OpenClaw */}
            <div className="p-5 rounded-lg border-2 border-primary/20 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🦞</span>
                <h4 className="font-bold text-lg">OpenClaw</h4>
                <Badge className="bg-primary/20 text-primary border-0 text-xs">Personal Assistant</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Originally <em>Clawdbot</em>, then <em>Moltbot</em>, now OpenClaw — a free, MIT-licensed
                personal AI agent built by Peter Steinberger. Runs on any OS, talks to your files, browser
                and messaging apps, and famously "keeps building upon itself" via Discord chat. Bring-your-own
                model (Claude, GPT, local LLMs).
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                <Badge variant="secondary" className="text-xs">Own-your-data</Badge>
                <Badge variant="secondary" className="text-xs">MIT</Badge>
              </div>
              <a
                href="https://openclaw.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                openclaw.ai <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Hermes Agent */}
            <div className="p-5 rounded-lg border-2 border-secondary/30 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🪽</span>
                <h4 className="font-bold text-lg">Hermes Agent</h4>
                <Badge variant="secondary" className="text-xs">Grows With You</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Built by <strong>Nous Research</strong> — the same crew behind the Hermes model series.
                Not a coding copilot, not a chat wrapper: an autonomous agent that lives on your server,
                <strong> remembers what it learns</strong> (Honcho memory), and gets more capable the longer
                it runs. Multi-platform messaging gateway, MCP client, voice mode, plugin architecture.
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="text-xs">Python</Badge>
                <Badge variant="secondary" className="text-xs">MCP</Badge>
                <Badge variant="secondary" className="text-xs">Persistent Memory</Badge>
                <Badge variant="secondary" className="text-xs">MIT</Badge>
              </div>
              <a
                href="https://hermes-agent.nousresearch.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                hermes-agent.nousresearch.com <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
            <strong>Why it matters:</strong> Both projects prove that the autonomous-agent pattern is
            shifting from research demos to <em>self-hostable infrastructure</em> — the same direction
            SiliconSoap pushes for multi-agent debate.
          </div>
        </CardContent>
      </Card>

      {/* Future Tech: Enterprise AI, MCP Skills, Self-Hosting */}
      <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-secondary" />
            What's Coming Next?
          </CardTitle>
          <CardDescription>
            The shift from AI as a chat interface to AI as an operating system for business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We are moving from "ask an AI for help" to "agents run the business while you approve."
            Enterprise SaaS is becoming a set of <strong>claws</strong> — pluggable endpoints that autonomous
            agents grip, manipulate and orchestrate. The AI Agentic Handbook calls this the
            "clawable enterprise" — every business process exposed as an agent-callable skill.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Clawable Enterprise */}
            <div className="p-4 rounded-lg border bg-card">
              <Building2 className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">The Clawable Enterprise</h4>
              <p className="text-sm text-muted-foreground mb-3">
                CRM, ERP, HRIS and accounting systems are no longer human-first dashboards.
                They become agent-callable APIs — <em>claws</em> — that autonomous workers grip
                to execute workflows end-to-end.
              </p>
              <a
                href="https://www.clawable.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                AI Agentic Handbook <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Flowwink MCP Skills */}
            <div className="p-4 rounded-lg border bg-card">
              <Globe className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">200+ MCP Skills</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Platforms like <strong>Flowwink</strong> expose hundreds of business skills via
                the Model Context Protocol (MCP). Agents discover, invoke and chain these skills
                without human assistance — only approvals.
              </p>
              <a
                href="https://www.flowwink.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                flowwink.com <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Token Tsunami & Self-Hosting */}
            <div className="p-4 rounded-lg border bg-card">
              <Server className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">The Token Tsunami</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Autonomous agents run 24/7, consuming <strong>hundreds of millions of tokens</strong>
                per day. Cloud API bills become unsustainable. Self-hosting open-weight models
                — exactly what SiliconSoap lets you benchmark — is no longer optional.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">24/7 Operation</Badge>
                <Badge variant="secondary" className="text-xs">Open-Weight</Badge>
                <Badge variant="secondary" className="text-xs">On-Premise</Badge>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
            <strong>Why it matters for SiliconSoap:</strong> Before you let agents run your
            enterprise, you need to <em>know</em> which models are reliable, fast and cost-effective.
            Our multi-agent debates are the proving ground — test models under pressure before
            giving them the keys to your business.
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

      {/* FAQ: Agent Approvals in Enterprise Workflows */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            FAQ: Agent Approvals in Enterprise Workflows
          </CardTitle>
          <CardDescription>
            How businesses safely delegate to autonomous agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-semibold mb-2 flex items-start gap-2">
                <ChevronDown className="h-4 w-4 text-primary mt-1 shrink-0" />
                What does "approval-only" mean?
              </h4>
              <p className="text-sm text-muted-foreground">
                The agent proposes and executes actions, but critical operations — payments,
                data exports, contract changes — pause for human approval. The human is the
                final gate, not the bottleneck.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-semibold mb-2 flex items-start gap-2">
                <ChevronDown className="h-4 w-4 text-primary mt-1 shrink-0" />
                How do agents handle sensitive data?
              </h4>
              <p className="text-sm text-muted-foreground">
                Self-hosted open-weight models keep data inside your perimeter. No tokens
                leave your network, no third-party API sees your PII, and audit trails stay local.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-semibold mb-2 flex items-start gap-2">
                <ChevronDown className="h-4 w-4 text-primary mt-1 shrink-0" />
                Can agents run 24/7 without supervision?
              </h4>
              <p className="text-sm text-muted-foreground">
                Yes — for low-risk, repetitive tasks. High-stakes actions still trigger approval
                workflows. The agent never sleeps, but it never signs a contract without you either.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-semibold mb-2 flex items-start gap-2">
                <ChevronDown className="h-4 w-4 text-primary mt-1 shrink-0" />
                What if an agent makes a mistake?
              </h4>
              <p className="text-sm text-muted-foreground">
                Multi-agent setups include a critic or judge agent that reviews outputs before
                they reach you. Debate and critique patterns catch errors that a single model misses.
              </p>
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

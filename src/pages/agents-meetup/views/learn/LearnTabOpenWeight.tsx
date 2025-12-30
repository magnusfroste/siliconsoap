import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scale, Shield, Wrench, DollarSign, Users, ExternalLink, TrendingDown, Network, Target, Sparkles, ArrowRight, MessageSquare, Coins, Zap, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const LearnTabOpenWeight = () => {
  const openModels = [
    { name: 'Llama 3.3', org: 'Meta', params: '70B', highlight: 'Industry standard' },
    { name: 'DeepSeek V3', org: 'DeepSeek', params: '671B MoE', highlight: 'Best value' },
    { name: 'Gemma 2', org: 'Google', params: '9B/27B', highlight: 'Efficient' },
    { name: 'Qwen 2.5', org: 'Alibaba', params: '72B', highlight: 'Multilingual' },
    { name: 'Mistral', org: 'Mistral AI', params: '7B-123B', highlight: 'Fast' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Why Open-Weight Models Matter</h2>
        <p className="text-muted-foreground">
          Open-weight models publish their trained parameters, allowing anyone to inspect, run, 
          and modify them. This transparency creates unique advantages.
        </p>
      </div>

      {/* Advantages Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Transparency & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Open weights mean researchers can audit the model for biases, safety issues, 
              or unexpected behaviors. No black box.
            </p>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <strong className="text-foreground">Self-hosted = your data stays private.</strong> When you 
              run an open model locally, your prompts never leave your infrastructure.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-primary" />
              Customization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Fine-tune on your own data to create specialized models for your domain — 
              medical, legal, finance, or any niche.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Add custom knowledge</li>
              <li>Adjust behavior and tone</li>
              <li>Remove unwanted capabilities</li>
              <li>Optimize for specific tasks</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              Cost Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Self-hosting eliminates per-token API fees. High-volume applications can save 
              significantly with one-time hardware investment.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/50">
                <div className="font-medium text-foreground">API Model</div>
                <div>Pay per token</div>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <div className="font-medium text-foreground">Self-Hosted</div>
                <div>Fixed hardware cost</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Community Innovation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Open models benefit from global community improvements: quantizations, 
              optimizations, fine-tunes, and new techniques.
            </p>
            <p>
              When Meta releases Llama, thousands of developers immediately create variants 
              optimized for specific use cases.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spotlight Models */}
      <Card>
        <CardHeader>
          <CardTitle>Leading Open-Weight Models</CardTitle>
          <CardDescription>
            These models rival or exceed closed alternatives in many benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {openModels.map((model) => (
              <div key={model.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.org}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{model.params}</Badge>
                  <Badge variant="secondary" className="text-xs">{model.highlight}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Open vs Closed Comparison */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Open vs Closed: Quick Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Aspect</th>
                  <th className="text-left py-2">Open-Weight</th>
                  <th className="text-left py-2">Closed (API-only)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">Transparency</td>
                  <td className="py-2">✅ Full access to weights</td>
                  <td className="py-2">❌ Black box</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">Privacy</td>
                  <td className="py-2">✅ Run locally, data stays private</td>
                  <td className="py-2">⚠️ Data sent to provider</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">Customization</td>
                  <td className="py-2">✅ Fine-tune freely</td>
                  <td className="py-2">⚠️ Limited to API params</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium text-foreground">Cost at Scale</td>
                  <td className="py-2">✅ Fixed hardware cost</td>
                  <td className="py-2">❌ Linear token cost</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-foreground">Setup Effort</td>
                  <td className="py-2">⚠️ Requires infrastructure</td>
                  <td className="py-2">✅ API key and go</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* The Next Frontier: Multi-Agent Future */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Network className="h-5 w-5" />
            <Badge variant="outline" className="border-primary/30 text-primary">2024-2025 Trend</Badge>
          </div>
          <CardTitle className="text-xl">Beyond the Plateau: The Multi-Agent Future</CardTitle>
          <CardDescription>
            Why specialized AI swarms are replacing monolithic giants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* The Plateau Problem */}
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold text-foreground">The Transformer Plateau</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Research shows that simply scaling LLMs larger is hitting diminishing returns. 
              Training costs double but improvements shrink. We're running out of quality training data, 
              and the biggest models struggle with the same reasoning tasks as smaller ones.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-background/50 text-center">
                <div className="font-bold text-foreground">10x</div>
                <div className="text-muted-foreground">compute increase</div>
              </div>
              <div className="p-2 rounded bg-background/50 text-center">
                <div className="font-bold text-foreground">→</div>
                <div className="text-muted-foreground">yields only</div>
              </div>
              <div className="p-2 rounded bg-background/50 text-center">
                <div className="font-bold text-foreground">~5%</div>
                <div className="text-muted-foreground">benchmark gain</div>
              </div>
            </div>
          </div>

          {/* The Multi-Agent Solution */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Multi-Agent Swarms: The Solution</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Instead of one massive model trying to do everything, the future is specialized agents 
              collaborating—each an expert in their domain. Like a team of specialists vs. one generalist.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="flex items-start gap-2 p-2 rounded bg-background/50">
                <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Researcher Agent</div>
                  <div className="text-xs text-muted-foreground">Gathers information, searches knowledge bases</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-background/50">
                <MessageSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Critic Agent</div>
                  <div className="text-xs text-muted-foreground">Challenges assumptions, finds flaws</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-background/50">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Fact-Checker Agent</div>
                  <div className="text-xs text-muted-foreground">Verifies claims, prevents hallucinations</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-background/50">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Synthesizer Agent</div>
                  <div className="text-xs text-muted-foreground">Combines insights into final output</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-background/30 p-2 rounded">
              <strong className="text-foreground">Why open-weight matters here:</strong> You can fine-tune 
              each agent for its specific role, run them privately, and swap components without vendor lock-in.
            </div>
          </div>

          {/* SiliconSoap Connection */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <Network className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">See It In Action: SiliconSoap</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              SiliconSoap lets you observe how different AI models interact, debate, and challenge each other. 
              Understand their personalities, strengths, and quirks before deploying them in your own agent swarms.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-4 text-xs">
              <div className="p-2 rounded bg-background/50 text-center">
                <div className="font-semibold text-foreground">Compare Models</div>
                <div className="text-muted-foreground">Side-by-side behavior</div>
              </div>
              <div className="p-2 rounded bg-background/50 text-center">
                <div className="font-semibold text-foreground">Watch Debates</div>
                <div className="text-muted-foreground">Multi-agent dynamics</div>
              </div>
              <div className="p-2 rounded bg-background/50 text-center">
                <div className="font-semibold text-foreground">Test Privately</div>
                <div className="text-muted-foreground">Open-weight models</div>
              </div>
            </div>
            <Link to="/new">
              <Button className="w-full sm:w-auto gap-2">
                Start an Agent Conversation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* How AI Pricing Works */}
      <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-secondary-foreground mb-2">
            <Coins className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="border-secondary/30">Understanding Costs</Badge>
          </div>
          <CardTitle className="text-xl">How AI Pricing Works</CardTitle>
          <CardDescription>
            Understanding tokens, credits, and the real cost of AI conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What are Tokens */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              What are Tokens?
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Tokens are the "currency" of AI language models. They're fragments of text—roughly 
              4 characters or ¾ of a word in English. Both your input (prompt) and the AI's 
              response consume tokens.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-background/50 text-center">
                <div className="font-bold text-lg text-foreground">1 token</div>
                <div className="text-muted-foreground">≈ 4 characters</div>
              </div>
              <div className="p-3 rounded bg-background/50 text-center">
                <div className="font-bold text-lg text-foreground">100 tokens</div>
                <div className="text-muted-foreground">≈ 75 words</div>
              </div>
              <div className="p-3 rounded bg-background/50 text-center">
                <div className="font-bold text-lg text-foreground">1K tokens</div>
                <div className="text-muted-foreground">≈ 2 paragraphs</div>
              </div>
            </div>
          </div>

          {/* Cloud vs Self-Hosted Costs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-destructive/5 border-destructive/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                <DollarSign className="h-4 w-4 text-destructive" />
                Cloud API Costs
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Every API call costs money. Prices vary wildly by model quality and provider.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-background/50">
                  <span>GPT-4o</span>
                  <span className="font-mono text-destructive">$2.50 / 1M tokens</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-background/50">
                  <span>Claude 3.5 Sonnet</span>
                  <span className="font-mono text-destructive">$3.00 / 1M tokens</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-background/50">
                  <span>DeepSeek V3</span>
                  <span className="font-mono text-primary">$0.27 / 1M tokens</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                <Server className="h-4 w-4 text-primary" />
                Self-Hosted Costs
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Run open-weight models yourself and pay only for hardware + electricity.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-background/50">
                  <span>Hardware (one-time)</span>
                  <span className="font-mono">$500-$10,000</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-background/50">
                  <span>Electricity</span>
                  <span className="font-mono">~$0.10-0.50/hour</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-background/50">
                  <span className="text-primary font-medium">Per-token cost</span>
                  <span className="font-mono text-primary">$0.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* SiliconSoap Credits */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
              <Coins className="h-4 w-4 text-primary" />
              SiliconSoap Credits: Fair & Simple
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              We abstract away the complexity. You see <strong className="text-foreground">credits</strong>, 
              we handle the token math behind the scenes. Credits are deducted based on actual 
              token usage—so efficient models cost you less.
            </p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-it-works" className="border-none">
                <AccordionTrigger className="text-sm py-2 hover:no-underline">
                  How credits work
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground space-y-2">
                  <p>
                    • Each credit covers approximately <strong className="text-foreground">100,000 tokens</strong> of usage
                  </p>
                  <p>
                    • A typical 2-agent debate uses <strong className="text-foreground">5,000-15,000 tokens</strong>
                  </p>
                  <p>
                    • Efficient models (DeepSeek, Mistral) stretch your credits further
                  </p>
                  <p>
                    • Premium models (GPT-4, Claude) use more tokens per response
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-3 p-3 rounded bg-background/50 text-xs text-muted-foreground">
              <strong className="text-foreground">Pro tip:</strong> For casual debates, use efficient open-weight 
              models. Save premium closed models for when quality matters most.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center p-6 rounded-xl bg-muted/50 border">
        <p className="text-muted-foreground mb-4">
          Open-weight models power the next generation of private, specialized AI swarms. 
          Start exploring them today.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="https://huggingface.co/models" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Browse on Hugging Face
            <ExternalLink className="h-4 w-4" />
          </a>
          <Link to="/new" className="inline-flex items-center gap-2 text-primary hover:underline">
            Test Agent Interactions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

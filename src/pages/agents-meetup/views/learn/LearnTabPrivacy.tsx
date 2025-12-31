import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, Cloud, Server, DollarSign, Lock, Scale,
  CheckCircle2, XCircle, ArrowRight, Coins, Zap, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearnTabPrivacy = () => {
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
        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Cloud API vs Private AI</h2>
        <p className="text-muted-foreground">
          Understand the differences between using cloud services and running models yourself — 
          for your privacy, wallet, and control.
        </p>
      </div>

      {/* Data Flow Comparison */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Where Does Your Data Go?</CardTitle>
          <CardDescription>
            The most important question when choosing an AI solution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cloud Flow */}
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold">Cloud API (OpenAI, Anthropic, Google)</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
              <Badge variant="outline">Your App</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">Internet</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="destructive">Provider Servers</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">Response</Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span><strong>Logging:</strong> Your prompts may be logged for training or debugging</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span><strong>Retention:</strong> Data often stored 30+ days</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span><strong>Jurisdiction:</strong> Data processed in provider's country (often US)</span>
              </li>
            </ul>
          </div>

          {/* Self-Hosted Flow */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Server className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Private AI (Self-hosted)</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
              <Badge variant="outline">Your App</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-primary">Your Infrastructure</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">Response</Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>No external transmission:</strong> Data never leaves your network</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Full logging control:</strong> You decide what gets saved</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Data sovereignty:</strong> Keep data in your jurisdiction</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Costs: Cloud vs Private
          </CardTitle>
          <CardDescription>
            Understanding what AI actually costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-destructive/5 border-destructive/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-destructive" />
                Cloud API Costs
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Pay per token — every API call costs money.
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
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Self-Hosted Costs
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                One-time hardware investment, then just electricity.
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

          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-medium mb-2">💡 When does each make sense?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Low volume:</strong> Cloud API is easiest to get started</li>
              <li>• <strong>High volume:</strong> Self-hosting becomes cheaper over time</li>
              <li>• <strong>Sensitive data:</strong> Self-hosting is the only option</li>
              <li>• <strong>Experimentation:</strong> SiliconSoap gives you both!</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Open vs Closed Quick Comparison */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Open vs Closed: Quick Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Aspect</th>
                  <th className="text-left py-2">Open-Weight</th>
                  <th className="text-left py-2">Closed (API)</th>
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

      {/* Leading Open Models */}
      <Card>
        <CardHeader>
          <CardTitle>Leading Open-Weight Models</CardTitle>
          <CardDescription>
            These models match or exceed closed alternatives
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

      {/* Security Benefits */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security Benefits of Private AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Full Auditability</h4>
                <p className="text-sm text-muted-foreground">
                  Inspect model weights, understand behavior, verify no hidden backdoors.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Air-Gapped Deployment</h4>
                <p className="text-sm text-muted-foreground">
                  Run models on completely isolated networks with zero internet connectivity.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Custom Hardening</h4>
                <p className="text-sm text-muted-foreground">
                  Fine-tune models to refuse specific requests or add custom safety layers.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Data Sovereignty</h4>
                <p className="text-sm text-muted-foreground">
                  Guarantee data never leaves your jurisdiction — meet the strictest requirements.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/10 border border-primary/20">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Ready to run AI locally?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Learn how to get started with self-hosting
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="default"
              className="gap-2"
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('tab', 'local');
                window.location.href = url.toString();
              }}
            >
              <Server className="h-4 w-4" />
              Run Locally Guide
              <ArrowRight className="h-4 w-4" />
            </Button>
            <a
              href="https://huggingface.co/models"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                Hugging Face
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

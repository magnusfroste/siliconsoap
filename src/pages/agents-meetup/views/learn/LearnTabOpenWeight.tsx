import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Shield, Wrench, DollarSign, Users, ExternalLink } from 'lucide-react';

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

      {/* CTA */}
      <div className="text-center p-6 rounded-xl bg-muted/50 border">
        <p className="text-muted-foreground mb-4">
          Ready to try open-weight models? They're available on SiliconSoap or you can self-host.
        </p>
        <a 
          href="https://huggingface.co/models" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          Browse models on Hugging Face
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

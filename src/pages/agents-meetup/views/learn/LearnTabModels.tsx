import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, Brain, FileText, MessageSquare, Lightbulb, Code, 
  TrendingUp, ExternalLink, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const contextWindowData = [
  { year: '2020', model: 'GPT-3', tokens: 2048, label: '2K', color: 'hsl(var(--muted-foreground))' },
  { year: '2023', model: 'GPT-4', tokens: 128000, label: '128K', color: 'hsl(var(--muted-foreground))' },
  { year: '2024', model: 'Gemini 1.5', tokens: 1000000, label: '1M', color: 'hsl(var(--primary))' },
  { year: '2025', model: 'Grok 4', tokens: 2000000, label: '2M', color: 'hsl(var(--primary))' },
  { year: '2025', model: 'Llama 4', tokens: 10000000, label: '10M', color: 'hsl(var(--accent-foreground))' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{data.model}</p>
        <p className="text-sm text-muted-foreground">{data.year}</p>
        <p className="text-primary font-bold">{data.label} tokens</p>
      </div>
    );
  }
  return null;
};

export const LearnTabModels = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Size vs Speed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Model Size: Speed vs Quality
          </CardTitle>
          <CardDescription>
            Understanding parameters and their implications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            AI models are measured by their <strong>parameter count</strong> — the number of learned values that define the model's behavior. 
            More parameters generally mean better reasoning, but slower responses and higher costs.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="text-2xl font-bold text-primary">3B</div>
              <div className="text-sm font-medium">Small Models</div>
              <div className="text-xs text-muted-foreground mt-2">
                ⚡ Very fast • Simple tasks • Runs on CPU
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="text-2xl font-bold text-primary">7-8B</div>
              <div className="text-sm font-medium">Medium Models</div>
              <div className="text-xs text-muted-foreground mt-2">
                🚀 Fast • General purpose • Consumer GPU
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="text-2xl font-bold text-primary">70B</div>
              <div className="text-sm font-medium">Large Models</div>
              <div className="text-xs text-muted-foreground mt-2">
                🧠 Strong reasoning • Complex tasks
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="text-2xl font-bold text-primary">405B+</div>
              <div className="text-sm font-medium">Frontier</div>
              <div className="text-xs text-muted-foreground mt-2">
                🏆 Best quality • Expert tasks
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Window with Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Context Window: Explosive Growth
          </CardTitle>
          <CardDescription>
            How much information a model can process at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <strong>context window</strong> defines how many tokens (~4 characters each) a model can read. 
            In just 2 years, we've gone from 32K to 10 million tokens — Shakespeare's complete works 15 times over.
          </p>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contextWindowData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis 
                  dataKey="model" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis 
                  scale="log"
                  domain={[1000, 15000000]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${value / 1000000}M`;
                    if (value >= 1000) return `${value / 1000}K`;
                    return value;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tokens" radius={[4, 4, 0, 0]}>
                  {contextWindowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div className="p-3 rounded-lg border bg-card text-center">
              <div className="text-lg font-semibold">4K - 8K</div>
              <div className="text-xs text-muted-foreground">Short conversations</div>
            </div>
            <div className="p-3 rounded-lg border bg-card text-center">
              <div className="text-lg font-semibold">32K - 128K</div>
              <div className="text-xs text-muted-foreground">Long documents</div>
            </div>
            <div className="p-3 rounded-lg border bg-card text-center">
              <div className="text-lg font-semibold">1M+</div>
              <div className="text-xs text-muted-foreground">Entire codebases</div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Data from{' '}
            <a 
              href="https://epoch.ai/data-insights/context-windows" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Epoch AI <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Model Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Model Types: Instruct vs Reasoning
          </CardTitle>
          <CardDescription>
            Different models for different tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Instruct Models */}
            <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Instruct Models</h4>
                <Badge className="bg-primary/20 text-primary border-0 text-xs">Most Common</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Trained to follow instructions and have conversations. Fast and versatile.
              </p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div>✅ Conversations & chat</div>
                <div>✅ Code generation</div>
                <div>✅ Summarization</div>
              </div>
              <div className="mt-3 text-xs">
                <span className="font-medium">Examples:</span> Llama 3.3, GPT-4o, Claude 3.5, Gemma 2
              </div>
            </div>

            {/* Reasoning Models */}
            <div className="p-4 rounded-lg border-2 border-secondary/30 bg-secondary/5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-secondary" />
                <h4 className="font-semibold">Reasoning Models</h4>
                <Badge variant="secondary" className="text-xs">Advanced</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                "Think step by step" before answering. Slower but more accurate.
              </p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div>✅ Math & logic</div>
                <div>✅ Complex analysis</div>
                <div>✅ Code debugging</div>
              </div>
              <div className="mt-3 text-xs">
                <span className="font-medium">Examples:</span> OpenAI o1, DeepSeek R1, Qwen QwQ
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
            <strong>Tip:</strong> Use instruct models for quick responses and reasoning models 
            when accuracy matters more than speed.
          </div>
        </CardContent>
      </Card>

      {/* Response Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Response Quality
          </CardTitle>
          <CardDescription>
            How model size affects output
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Larger models exhibit <strong>emergent abilities</strong> — capabilities that only appear at scale:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Multi-step reasoning:</strong> Breaking complex problems into steps</li>
              <li><strong>Nuanced understanding:</strong> Grasping subtle context</li>
              <li><strong>Better instruction following:</strong> More accurately doing what you ask</li>
              <li><strong>Fewer hallucinations:</strong> Less likely to make things up</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Base Models (brief) */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Code className="h-5 w-5 text-muted-foreground" />
            Base Models (for developers)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Raw neural networks trained to predict the next token. Used mainly by researchers 
            and for fine-tuning — rarely used directly in applications. Instruct models are base models 
            that have been fine-tuned to follow instructions.
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/10 border border-primary/20">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Try different models yourself</h3>
          <p className="text-sm text-muted-foreground mb-4">
            See how different models reason and debate
          </p>
          <Link to="/new">
            <Button className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Start a conversation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

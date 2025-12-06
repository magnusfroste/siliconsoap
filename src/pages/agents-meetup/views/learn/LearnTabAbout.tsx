import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Globe, Sparkles, TrendingUp, Brain, Database, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const contextWindowData = [
  { year: '2020', model: 'GPT-3', tokens: 2048, label: '2K', color: 'hsl(var(--muted-foreground))' },
  { year: '2023', model: 'GPT-4', tokens: 128000, label: '128K', color: 'hsl(var(--muted-foreground))' },
  { year: '2024', model: 'Gemini 1.5', tokens: 1000000, label: '1M', color: 'hsl(var(--primary))' },
  { year: '2025', model: 'Grok 4', tokens: 2000000, label: '2M', color: 'hsl(var(--primary))' },
  { year: '2025', model: 'Llama 4', tokens: 10000000, label: '10M', color: 'hsl(var(--accent-foreground))' },
];

const referencePoints = [
  { tokens: '2K', example: 'A short email', icon: '📄' },
  { tokens: '128K', example: 'A full novel', icon: '📖' },
  { tokens: '1M', example: 'Your entire codebase', icon: '💻' },
  { tokens: '2M', example: "Shakespeare's complete works", icon: '📚' },
  { tokens: '10M', example: 'The complete IRS tax code', icon: '🏛️' },
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

export const LearnTabAbout = () => {
  return (
    <div className="space-y-8">
      {/* Founder's Note Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="text-center pb-4">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mx-auto mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">A Note from the Founder</span>
          </div>
          <CardTitle className="text-2xl md:text-3xl">The AI Revolution is Accelerating</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-lg leading-relaxed">
            24 months ago, AI models struggled with single documents – <strong>32K tokens was premium</strong>. 
            Today, xAI's Grok 4 Fast handles <span className="text-primary font-semibold">2 million tokens</span>, 
            and Meta's Llama 4 Scout processes <span className="text-primary font-semibold">10 million tokens</span> in a single call.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            That's Shakespeare's complete works – <strong>15 times over</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Context Window Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Context Window Growth (2020-2025)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Logarithmic scale showing exponential growth in model context capacity
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contextWindowData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis 
                  dataKey="model" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  scale="log"
                  domain={[1000, 15000000]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
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
          <p className="text-xs text-muted-foreground text-center mt-4">
            Data based on research from{' '}
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

      {/* What This Means - Reference Points */}
      <Card>
        <CardHeader>
          <CardTitle>What This Means in Practice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {referencePoints.map((point) => (
              <div 
                key={point.tokens} 
                className="text-center p-4 rounded-lg bg-muted/50 border border-border/50"
              >
                <span className="text-3xl mb-2 block">{point.icon}</span>
                <p className="font-bold text-primary">{point.tokens}</p>
                <p className="text-sm text-muted-foreground">{point.example}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vision Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            What's Coming Next
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            We've been experimenting with helping LLMs access even more data through innovative techniques:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <Database className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">RAG</h4>
              <p className="text-sm text-muted-foreground">
                Retrieval-Augmented Generation – connecting models to external knowledge bases in real-time
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Zap className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">CAG</h4>
              <p className="text-sm text-muted-foreground">
                Cache-Augmented Generation – intelligent caching for faster, more efficient responses
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <Brain className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">Enterprise AI</h4>
              <p className="text-sm text-muted-foreground">
                Soon, entire enterprise systems can reside inside an LLM – without retraining for each transaction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Founder Profile */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground shrink-0">
              MF
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Magnus Froste</h3>
              <p className="text-muted-foreground mb-4">
                Founder & Creator of SiliconSoap
              </p>
              <p className="text-muted-foreground italic mb-4">
                "This initiative exists to help evaluate AI models in a more practical way – 
                not through dry benchmarks, but through real conversations where you can see 
                how models think, reason, and debate. Play, explore, and discover the full potential."
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="https://github.com/magnusfroste" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="https://www.froste.eu" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    froste.eu
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold mb-4">Ready to explore?</h3>
        <Button asChild size="lg">
          <Link to="/new" className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Start Your First AI Debate
          </Link>
        </Button>
      </div>
    </div>
  );
};

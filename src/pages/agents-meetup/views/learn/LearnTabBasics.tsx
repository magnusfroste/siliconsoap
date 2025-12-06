import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Brain, FileText, Clock } from 'lucide-react';

export const LearnTabBasics = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Size vs Speed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Size vs Speed: The Fundamental Tradeoff
          </CardTitle>
          <CardDescription>
            Understanding parameter counts and their implications
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
                ⚡ Very fast • Simple tasks • Low cost • Runs on CPU
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="text-2xl font-bold text-primary">7-8B</div>
              <div className="text-sm font-medium">Medium Models</div>
              <div className="text-xs text-muted-foreground mt-2">
                🚀 Fast • General purpose • Affordable • Consumer GPU
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="text-2xl font-bold text-primary">70B</div>
              <div className="text-sm font-medium">Large Models</div>
              <div className="text-xs text-muted-foreground mt-2">
                🧠 Strong reasoning • Complex tasks • Higher cost
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="text-2xl font-bold text-primary">405B+</div>
              <div className="text-sm font-medium">Frontier Models</div>
              <div className="text-xs text-muted-foreground mt-2">
                🏆 Best quality • Expert tasks • Premium cost
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Window */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Context Window
          </CardTitle>
          <CardDescription>
            How much information a model can process at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <strong>context window</strong> defines how many tokens (roughly 4 characters each) a model can read and consider when generating a response. 
            Larger context windows allow for longer conversations and more document analysis.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-lg font-semibold">4K - 8K tokens</div>
              <div className="text-xs text-muted-foreground">~3,000-6,000 words</div>
              <div className="text-sm mt-2">Short conversations, quick Q&A</div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-lg font-semibold">32K - 128K tokens</div>
              <div className="text-xs text-muted-foreground">~25,000-100,000 words</div>
              <div className="text-sm mt-2">Long docs, extended chats</div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-lg font-semibold">1M+ tokens</div>
              <div className="text-xs text-muted-foreground">~750,000+ words</div>
              <div className="text-sm mt-2">Entire codebases, books</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Response Quality
          </CardTitle>
          <CardDescription>
            How model size affects reasoning and output
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Larger models exhibit <strong>emergent abilities</strong> — capabilities that appear only at scale:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Multi-step reasoning:</strong> Breaking complex problems into steps</li>
              <li><strong>Nuanced understanding:</strong> Grasping subtle context and implications</li>
              <li><strong>Better instruction following:</strong> More accurately doing what you ask</li>
              <li><strong>Fewer hallucinations:</strong> Less likely to make things up</li>
              <li><strong>Domain expertise:</strong> Deeper knowledge in specialized fields</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Quick Decision Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-2">Choose smaller models (3B-8B) for:</div>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Quick responses</li>
                <li>Simple classification</li>
                <li>Basic summarization</li>
                <li>High-volume processing</li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">Choose larger models (70B+) for:</div>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Complex analysis</li>
                <li>Code generation</li>
                <li>Creative writing</li>
                <li>Expert-level reasoning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

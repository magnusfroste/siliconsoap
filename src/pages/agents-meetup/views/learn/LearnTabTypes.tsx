import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Lightbulb, Code, Sparkles } from 'lucide-react';

export const LearnTabTypes = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-muted-foreground">
          Not all AI models are trained the same way. Understanding model types helps you choose 
          the right tool for each task.
        </p>
      </div>

      {/* Base Models */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Base Models
            </CardTitle>
            <Badge variant="outline">Foundation</Badge>
          </div>
          <CardDescription>
            The raw neural network trained on text data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Base models are trained to predict the next token in a sequence. They're powerful but not 
            designed for conversation — they'll continue any text you give them, for better or worse.
          </p>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="text-xs font-medium text-muted-foreground mb-2">Example behavior:</div>
            <div className="font-mono text-sm">
              <span className="text-muted-foreground">Input:</span> "The capital of France is"<br />
              <span className="text-muted-foreground">Output:</span> "Paris. It is known for the Eiffel Tower..."
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Used mainly by researchers and for fine-tuning. Rarely used directly in applications.
          </p>
        </CardContent>
      </Card>

      {/* Instruct Models */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Instruct Models
            </CardTitle>
            <Badge className="bg-primary/20 text-primary border-0">Most Common</Badge>
          </div>
          <CardDescription>
            Fine-tuned to follow instructions and have conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Instruct models are fine-tuned using <strong>instruction tuning</strong> and <strong>RLHF</strong> (Reinforcement Learning from Human Feedback) 
            to follow user instructions, answer questions helpfully, and refuse harmful requests.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="font-medium mb-2">✅ Great for:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Conversations & chat</li>
                <li>• Following specific instructions</li>
                <li>• Summarization & rewriting</li>
                <li>• Code generation</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="font-medium mb-2">📋 Examples:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Llama 3.3 Instruct</li>
                <li>• GPT-4o, Claude 3.5</li>
                <li>• Gemma 2 Instruct</li>
                <li>• Mistral Instruct</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reasoning Models */}
      <Card className="border-secondary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-secondary" />
              Reasoning Models
            </CardTitle>
            <Badge variant="secondary">Advanced</Badge>
          </div>
          <CardDescription>
            Trained to "think step by step" before answering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Reasoning models use <strong>Chain-of-Thought (CoT)</strong> techniques to break down complex problems 
            before giving final answers. They explicitly show their reasoning process.
          </p>
          
          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
            <div className="text-xs font-medium text-muted-foreground mb-2">How they work:</div>
            <div className="text-sm space-y-2">
              <div className="p-2 rounded bg-background/50">
                <span className="text-muted-foreground">1.</span> Receive complex question
              </div>
              <div className="p-2 rounded bg-background/50">
                <span className="text-muted-foreground">2.</span> Generate internal "thinking" (sometimes hidden)
              </div>
              <div className="p-2 rounded bg-background/50">
                <span className="text-muted-foreground">3.</span> Produce well-reasoned final answer
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="font-medium mb-2">✅ Best for:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Math & logic puzzles</li>
                <li>• Complex analysis</li>
                <li>• Multi-step problems</li>
                <li>• Debugging code</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="font-medium mb-2">📋 Examples:</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• OpenAI o1, o1-mini</li>
                <li>• DeepSeek R1</li>
                <li>• Claude 3.5 Sonnet (CoT)</li>
                <li>• Qwen QwQ</li>
              </ul>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
            <strong>Trade-off:</strong> Reasoning models are slower and more expensive because they generate 
            more tokens internally. Use them when accuracy matters more than speed.
          </div>
        </CardContent>
      </Card>

      {/* Chat vs Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Chat vs Completion API
          </CardTitle>
          <CardDescription>
            Two ways to interact with models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Chat API</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Designed for multi-turn conversations with distinct roles (system, user, assistant).
              </p>
              <div className="p-3 rounded-lg bg-muted/50 border text-xs font-mono">
                {"messages: [\n  {role: 'user', content: '...'},\n  {role: 'assistant', content: '...'}\n]"}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Completion API</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Raw text-in, text-out. You provide a prompt, model continues it.
              </p>
              <div className="p-3 rounded-lg bg-muted/50 border text-xs font-mono">
                {"prompt: 'Complete this: ...'\nresponse: '...'"}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Most modern applications use the Chat API. SiliconSoap uses Chat API for all conversations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Server, Cpu, HardDrive, Terminal, Download, ExternalLink, Zap, Shield, Wifi, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearnTabSelfHosting = () => {
  const tools = [
    {
      name: 'LM Studio',
      description: 'GUI app for Mac/Windows/Linux. Easiest way to get started.',
      best: 'Beginners',
      link: 'https://lmstudio.ai',
    },
    {
      name: 'Ollama',
      description: 'CLI-first tool. Great for Docker and automation.',
      best: 'Developers',
      link: 'https://ollama.ai',
    },
    {
      name: 'vLLM',
      description: 'High-performance inference server. Production-grade.',
      best: 'Production',
      link: 'https://docs.vllm.ai',
    },
    {
      name: 'llama.cpp',
      description: 'CPU-optimized C++ inference. Runs anywhere.',
      best: 'Low resources',
      link: 'https://github.com/ggerganov/llama.cpp',
    },
  ];

  const vramRequirements = [
    { size: '3B', q4: '2 GB', q8: '4 GB', fp16: '6 GB' },
    { size: '7-8B', q4: '4 GB', q8: '8 GB', fp16: '16 GB' },
    { size: '13B', q4: '8 GB', q8: '14 GB', fp16: '26 GB' },
    { size: '70B', q4: '40 GB', q8: '70 GB', fp16: '140 GB' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <Server className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Run AI Models Locally</h2>
        <p className="text-muted-foreground">
          Self-hosting gives you complete control over your AI infrastructure. 
          No API costs, no data leaving your machine, full privacy.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
          <h4 className="font-medium">100% Private</h4>
          <p className="text-xs text-muted-foreground">Data never leaves your machine</p>
        </Card>
        <Card className="text-center p-4">
          <Wifi className="h-8 w-8 text-primary mx-auto mb-2" />
          <h4 className="font-medium">Works Offline</h4>
          <p className="text-xs text-muted-foreground">No internet required after download</p>
        </Card>
        <Card className="text-center p-4">
          <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
          <h4 className="font-medium">No API Costs</h4>
          <p className="text-xs text-muted-foreground">One-time hardware investment</p>
        </Card>
      </div>

      {/* Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Self-Hosting Tools
          </CardTitle>
          <CardDescription>
            Choose based on your experience level and use case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <a 
                key={tool.name}
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-muted/50 border hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium group-hover:text-primary transition-colors">
                    {tool.name}
                  </div>
                  <Badge variant="outline" className="text-xs">{tool.best}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                <div className="flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Visit website <ExternalLink className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hardware Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Hardware Requirements
          </CardTitle>
          <CardDescription>
            VRAM needed based on model size and quantization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Model Size</th>
                  <th className="text-left py-2">
                    <div>Q4 (4-bit)</div>
                    <div className="text-xs font-normal text-muted-foreground">Smallest, some quality loss</div>
                  </th>
                  <th className="text-left py-2">
                    <div>Q8 (8-bit)</div>
                    <div className="text-xs font-normal text-muted-foreground">Good balance</div>
                  </th>
                  <th className="text-left py-2">
                    <div>FP16 (16-bit)</div>
                    <div className="text-xs font-normal text-muted-foreground">Full quality</div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {vramRequirements.map((req) => (
                  <tr key={req.size} className="border-b">
                    <td className="py-2 font-medium text-foreground">{req.size}</td>
                    <td className="py-2">{req.q4}</td>
                    <td className="py-2">{req.q8}</td>
                    <td className="py-2">{req.fp16}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border text-sm">
            <strong>Tip:</strong> Most consumer GPUs (RTX 3060, 4060) have 8-12 GB VRAM. 
            This comfortably runs 7-8B models at Q4/Q8 quantization, which is great for most tasks.
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Quick Start with Ollama
          </CardTitle>
          <CardDescription>
            Get a local model running in under 5 minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">1</div>
              <div>
                <div className="font-medium">Install Ollama</div>
                <div className="text-sm text-muted-foreground">Download from ollama.ai and run the installer</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">2</div>
              <div>
                <div className="font-medium">Pull a model</div>
                <div className="font-mono text-sm bg-muted p-2 rounded mt-1">ollama pull llama3.2</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">3</div>
              <div>
                <div className="font-medium">Start chatting</div>
                <div className="font-mono text-sm bg-muted p-2 rounded mt-1">ollama run llama3.2</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            Where to Download Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <a 
            href="https://huggingface.co" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors group"
          >
            <div className="text-3xl">🤗</div>
            <div>
              <div className="font-medium group-hover:text-primary transition-colors">Hugging Face</div>
              <p className="text-sm text-muted-foreground">
                The largest repository of open-source AI models. Download GGUF files for local inference 
                or original weights for fine-tuning.
              </p>
              <div className="flex items-center gap-1 text-xs text-primary mt-2">
                huggingface.co <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </a>
          
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="font-medium mb-2">Recommended model collections:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <a href="https://huggingface.co/meta-llama" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">meta-llama</a> — Official Llama models</li>
              <li>• <a href="https://huggingface.co/TheBloke" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TheBloke</a> — GGUF quantized versions of popular models</li>
              <li>• <a href="https://huggingface.co/google" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">google</a> — Gemma models</li>
              <li>• <a href="https://huggingface.co/mistralai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mistralai</a> — Mistral models</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/10 border border-primary/20">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Ready to try?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            See how different models behave in debates
          </p>
          <Link to="/new">
            <Button className="gap-2">
              <Server className="h-4 w-4" />
              Start a conversation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

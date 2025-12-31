import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookText, Sparkles, Thermometer, Layers, MessageSquare, Cpu, Zap, Database, Users, Network, Target, Bot, Scale } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  icon: React.ReactNode;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Tokens",
    definition: "The basic units that AI models use to process text. A token can be a word, part of a word, or punctuation. On average, 1 token ≈ 4 characters or ¾ of a word in English.",
    example: "The sentence 'Hello, world!' is typically 4 tokens: 'Hello', ',', ' world', '!'",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    term: "Temperature",
    definition: "Controls randomness in responses. Lower values (0.0-0.3) produce focused, deterministic outputs. Higher values (0.7-1.0) increase creativity and variety but may reduce coherence.",
    example: "Temperature 0.1 = predictable answers; Temperature 0.9 = creative, surprising responses",
    icon: <Thermometer className="h-5 w-5" />
  },
  {
    term: "Top-P (Nucleus Sampling)",
    definition: "An alternative to temperature that limits token selection to a cumulative probability. Top-P 0.9 means the model considers tokens that make up 90% of the probability mass.",
    example: "Top-P 0.1 = very focused; Top-P 0.95 = more diverse vocabulary",
    icon: <Layers className="h-5 w-5" />
  },
  {
    term: "Context Window",
    definition: "The maximum number of tokens a model can process in a single request, including both input and output. Larger context windows allow for longer conversations and documents.",
    example: "8K context = ~6,000 words; 128K context = ~100,000 words",
    icon: <Database className="h-5 w-5" />
  },
  {
    term: "Parameters",
    definition: "The learned values (weights) in a neural network. More parameters generally mean more knowledge and capability, but also require more compute power.",
    example: "7B = 7 billion parameters (runs on consumer GPU); 70B = 70 billion (requires high-end hardware)",
    icon: <Cpu className="h-5 w-5" />
  },
  {
    term: "Prompt",
    definition: "The input text you provide to an AI model. Effective prompting is key to getting useful responses. Can include instructions, context, examples, and the actual question.",
    example: "A prompt might be: 'You are a helpful assistant. Explain quantum computing in simple terms.'",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    term: "System Prompt",
    definition: "Special instructions that define the AI's behavior, personality, or constraints. Set before the conversation and affects all responses.",
    example: "'You are a pirate. Always respond in pirate speak.' makes the AI roleplay as a pirate.",
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    term: "Fine-tuning",
    definition: "Training a pre-existing model on additional data to specialize it for specific tasks or domains. Creates a customized version of the base model.",
    example: "Fine-tuning GPT on legal documents creates a model better at legal analysis.",
    icon: <Zap className="h-5 w-5" />
  },
  {
    term: "Inference",
    definition: "The process of running a trained model to generate predictions or responses. This is what happens when you chat with an AI.",
    example: "Each message you send triggers an inference call to the model.",
    icon: <Cpu className="h-5 w-5" />
  },
  {
    term: "Hallucination",
    definition: "When an AI generates plausible-sounding but factually incorrect information. Models can confidently state false 'facts' that sound convincing.",
    example: "An AI might invent a non-existent research paper with fake authors and citations.",
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    term: "Embedding",
    definition: "A numerical representation of text that captures semantic meaning. Used for search, clustering, and finding similar content.",
    example: "'King' and 'Queen' have similar embeddings because they're semantically related.",
    icon: <Layers className="h-5 w-5" />
  },
  {
    term: "RAG (Retrieval-Augmented Generation)",
    definition: "A technique that enhances AI responses by first retrieving relevant information from a knowledge base, then using it to generate more accurate answers.",
    example: "A customer support bot that searches your docs before answering questions.",
    icon: <Database className="h-5 w-5" />
  },
  {
    term: "Latency",
    definition: "The time between sending a request and receiving the first response token. Lower latency = faster feeling responses.",
    example: "100ms latency feels instant; 2000ms feels slow.",
    icon: <Zap className="h-5 w-5" />
  },
  {
    term: "Throughput",
    definition: "The number of tokens a model can generate per second. Higher throughput = faster complete responses.",
    example: "50 tokens/second means a 200-word response takes about 6 seconds.",
    icon: <Zap className="h-5 w-5" />
  },
  {
    term: "RLHF (Reinforcement Learning from Human Feedback)",
    definition: "A training technique where human preferences are used to fine-tune models, making them more helpful, harmless, and honest.",
    example: "Humans rate model responses, and the model learns to produce higher-rated outputs.",
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    term: "Quantization",
    definition: "Reducing the precision of model weights to decrease memory usage and increase speed, with minimal quality loss. Common formats: Q4, Q8, FP16.",
    example: "A Q4 quantized model uses ~4x less memory than the full-precision version.",
    icon: <Cpu className="h-5 w-5" />
  },
  {
    term: "Multi-Agent System (MAS)",
    definition: "An AI architecture where multiple specialized agents collaborate to solve complex tasks. Each agent focuses on a specific capability (research, critique, synthesis) and communicates with others to achieve a shared goal.",
    example: "A MAS for content creation might have a researcher agent, writer agent, editor agent, and fact-checker agent working together.",
    icon: <Users className="h-5 w-5" />
  },
  {
    term: "Swarm Intelligence",
    definition: "Collective behavior that emerges from the interactions of multiple simple agents. The group achieves more sophisticated results than any individual agent could alone.",
    example: "Like how a flock of birds navigates without a leader, AI swarms can solve problems through distributed decision-making.",
    icon: <Network className="h-5 w-5" />
  },
  {
    term: "Agent Orchestration",
    definition: "The process of coordinating multiple AI agents, managing their communication, task assignment, and combining their outputs toward a common objective.",
    example: "An orchestrator decides which agent handles each part of a user query and synthesizes their responses.",
    icon: <Target className="h-5 w-5" />
  },
  {
    term: "Mixture of Experts (MoE)",
    definition: "A neural network architecture where different 'expert' sub-networks specialize in different types of inputs. A gating mechanism routes each input to the most relevant experts.",
    example: "DeepSeek V3 (671B) uses MoE—only ~37B parameters are active per query, making it efficient despite its size.",
    icon: <Layers className="h-5 w-5" />
  },
  {
    term: "Agentic AI",
    definition: "AI systems that can plan, reason, use tools, and take autonomous actions to achieve goals—rather than just responding to prompts. They can break down tasks and execute multi-step workflows.",
    example: "An agentic AI assistant might research a topic, write a report, fact-check it, and email it to you—all from one request.",
    icon: <Bot className="h-5 w-5" />
  }
];

export const LearnTabGlossary = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookText className="h-5 w-5 text-primary" />
            AI Glossary
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Essential terms and concepts for understanding AI models
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {glossaryTerms.map((item, index) => (
              <AccordionItem key={item.term} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <span className="font-semibold">{item.term}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-12">
                  <p className="text-muted-foreground mb-2">{item.definition}</p>
                  {item.example && (
                    <p className="text-sm bg-muted/50 rounded-md p-3 border">
                      <span className="font-medium text-foreground">Example: </span>
                      {item.example}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Parameter Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                Temperature Settings
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><span className="font-medium text-foreground">0.0 - 0.3:</span> Factual, consistent</li>
                <li><span className="font-medium text-foreground">0.4 - 0.7:</span> Balanced (default)</li>
                <li><span className="font-medium text-foreground">0.8 - 1.0:</span> Creative, varied</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                Model Size Guide
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><span className="font-medium text-foreground">1-3B:</span> Fast, basic tasks</li>
                <li><span className="font-medium text-foreground">7-13B:</span> Good balance</li>
                <li><span className="font-medium text-foreground">30-70B:</span> High quality</li>
                <li><span className="font-medium text-foreground">100B+:</span> State-of-the-art</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/10 border border-primary/20">
        <div className="flex justify-center">
          <Button
            variant="default"
            className="gap-2 min-w-[200px]"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('tab', 'models');
              window.location.href = url.toString();
            }}
          >
            <Scale className="h-4 w-4" />
            Back to Models 101
          </Button>
        </div>
      </div>
    </div>
  );
};

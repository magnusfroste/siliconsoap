import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Github,
  Globe,
  Sparkles,
  Linkedin,
  Twitter,
  MessageSquare,
  Users,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { LearnAgentBlocks } from "@/components/learn/LearnAgentBlocks";
import { PageHeader } from '@/components/editorial/PageHeader';
import { CtaBand } from '@/components/editorial/CtaBand';
import { useEffect } from "react";

const FAQ_SCHEMA_ID = "about-faq-schema";

const FAQ_ITEMS = [
  {
    question: "What is SiliconSoap?",
    answer:
      "SiliconSoap is a multi-agent AI conversation platform where 2-4 large language models debate, collaborate, and discuss any topic you choose. It lets you compare how different models reason, argue, and express personality through real conversation rather than synthetic benchmarks.",
  },
  {
    question: "Which AI models can I use?",
    answer:
      "You can pick from 30+ curated models across providers including OpenAI (GPT-4o, GPT-4.1), Google (Gemini, Gemma), Meta (Llama 3.3, Llama 4), DeepSeek (R1, V3), Qwen, Mistral, x-ai (Grok), and z-ai (GLM). Both open-weight and proprietary models are supported.",
  },
  {
    question: "Is SiliconSoap free to use?",
    answer:
      "Yes. Every new account gets free credits to start debates immediately. No API key or credit card is required. You can purchase additional credits if you want to run more debates.",
  },
  {
    question: "Do I need my own OpenRouter API key?",
    answer:
      "No. SiliconSoap uses a shared, server-side OpenRouter key, so you can start debating instantly without managing your own keys. All AI calls run securely through our backend.",
  },
  {
    question: "Can I share the debates I create?",
    answer:
      "Yes. Every debate gets a unique public share link with a generated preview image. Shared debates are read-only, indexable by search engines, and include reactions and analysis.",
  },
  {
    question: "What makes SiliconSoap different from ChatGPT or Claude?",
    answer:
      "ChatGPT and Claude are single-agent assistants. SiliconSoap orchestrates multiple AI models in the same conversation, assigning each one a persona, model, and stance, so you can watch them disagree, build on each other, or pick a winner via the Judge Bot analysis.",
  },
];

export const AboutView = () => {
  usePageMeta({
    title: "About SiliconSoap - Founded by Magnus Froste",
    description:
      "SiliconSoap helps you evaluate AI models through real conversations. Watch models debate, compare their reasoning, and discover their personalities.",
    canonicalPath: "/about",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ],
  });

  // Inject FAQPage JSON-LD for AEO + Google rich results
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

    const existing = document.getElementById(FAQ_SCHEMA_ID);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = FAQ_SCHEMA_ID;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(FAQ_SCHEMA_ID)?.remove();
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:py-12 md:px-8">
      <div className="space-y-8">
        <PageHeader eyebrow="About SiliconSoap" title="See how AI models really reason — and let your assistant ask them too." lead="Real conversations between models from different labs. Watch them disagree, compare their reasoning, or give your own AI assistant a second opinion." />
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="rounded-lg p-6 shadow-none"><MessageSquare className="h-6 w-6 text-primary mb-4"/><h2 className="font-display text-xl mb-2">Watch debates</h2><p className="text-sm text-muted-foreground mb-3">Read real transcripts and see how models challenge each other.</p><Button variant="link" asChild className="min-h-11 px-0"><Link to="/explore">Explore debates →</Link></Button></Card>
          <Card className="rounded-lg p-6 shadow-none"><Users className="h-6 w-6 text-primary mb-4"/><h2 className="font-display text-xl mb-2">Compare models</h2><p className="text-sm text-muted-foreground mb-3">Different labs, origins, licenses and ways of reasoning.</p><div className="flex flex-wrap gap-4"><Button variant="link" asChild className="min-h-11 px-0"><Link to="/models">The roster →</Link></Button><Button variant="link" asChild className="min-h-11 px-0"><Link to="/scoreboard">Scoreboard →</Link></Button></div></Card>
          <Card className="rounded-lg p-6 shadow-none"><Sparkles className="h-6 w-6 text-primary mb-4"/><h2 className="font-display text-xl mb-2">Second opinion for your agent</h2><p className="text-sm text-muted-foreground mb-3">Let your assistant ask a panel to cross-check a question or draft.</p><Button variant="link" asChild className="min-h-11 px-0"><Link to="/connect">Connect your agent →</Link></Button></Card>
        </div>

        {/* Founder Profile */}
        <Card className="rounded-lg shadow-none">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-display text-3xl font-bold shrink-0">
                MF
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-2xl font-semibold mb-2">Magnus Froste</h3>
                <p className="text-muted-foreground mb-4">Founder & Creator</p>
                <p className="text-muted-foreground italic mb-4">
                  "I created SiliconSoap to help people evaluate AI models in a practical way. 
                  Play, explore, and discover the full potential."
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button variant="outline" size="sm" className="min-h-11" asChild>
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
                  <Button variant="outline" size="sm" className="min-h-11" asChild>
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
                  <Button variant="outline" size="sm" className="min-h-11" asChild>
                    <a
                      href="https://linkedin.com/in/froste"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="min-h-11" asChild>
                    <a
                      href="https://twitter.com/magnusfroste"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent-maintained blocks (written over MCP) */}
        <LearnAgentBlocks tab="about" />

        <CtaBand title="Put the models in the same room." label="Start a debate" to="/new" secondary={{label:'Connect your agent',to:'/connect'}} />
      </div>
    </div>
  );
};

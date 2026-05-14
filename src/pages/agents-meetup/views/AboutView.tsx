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
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Mission Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mx-auto mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">About SiliconSoap</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Evaluate AI Through Real Conversations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not through dry benchmarks — but by watching how models think, 
            reason, and debate with each other.
          </p>
        </div>

        {/* What is SiliconSoap */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Watch Debates</h3>
            <p className="text-sm text-muted-foreground">
              Let AI models discuss topics and see how they argue
            </p>
          </Card>
          <Card className="text-center p-6">
            <Users className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Compare Models</h3>
            <p className="text-sm text-muted-foreground">
              Discover differences in personality, style, and reasoning
            </p>
          </Card>
          <Card className="text-center p-6">
            <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Learn AI</h3>
            <p className="text-sm text-muted-foreground">
              Our crash course covers everything from basics to multi-agent systems
            </p>
          </Card>
        </div>

        {/* Founder Profile */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground shrink-0">
                MF
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Magnus Froste</h3>
                <p className="text-muted-foreground mb-4">Founder & Creator</p>
                <p className="text-muted-foreground italic mb-4">
                  "I created SiliconSoap to help people evaluate AI models in a practical way. 
                  Play, explore, and discover the full potential."
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
                  <Button variant="outline" size="sm" asChild>
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
                  <Button variant="outline" size="sm" asChild>
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

        {/* CTAs */}
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-6">Ready to explore?</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/new" className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Start an AI Debate
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/learn" className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                AI Crash Course
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

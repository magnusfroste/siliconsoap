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

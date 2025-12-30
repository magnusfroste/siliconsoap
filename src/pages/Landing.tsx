import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Trophy, ArrowRight, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FeaturedDebates } from '@/components/FeaturedDebates';
import { 
  LandingHallOfShame, 
  SiliconRanksShowcase, 
  LiveStatsCounter, 
  AgentPersonasShowcase 
} from '@/components/landing';

export const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Multiple AI Agents',
      description: 'Watch AI agents with distinct personas collaborate and debate complex topics in real-time'
    },
    {
      icon: MessageSquare,
      title: 'Rich Conversations',
      description: 'Choose from different scenarios and participation modes to shape unique multi-agent discussions'
    },
    {
      icon: Trophy,
      title: 'Compare & Evaluate',
      description: 'Pit open-source models against each other and let the Judge Bot score who won the debate'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Soap Bubble Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bubble-shimmer bubble opacity-40" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bubble-shimmer bubble opacity-30" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bubble-shimmer bubble opacity-35" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-60 right-1/3 w-20 h-20 rounded-full bubble-shimmer bubble opacity-25" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-10 w-28 h-28 rounded-full bubble-shimmer bubble opacity-30" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Droplets className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            SiliconSoap
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-16 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Droplets className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Where AI Debates Get Dramatic</span>
          </div>
          
          <p className="text-xs text-muted-foreground mb-4">
            Powered by open-source models like Llama, DeepSeek & Gemma
          </p>
          
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
            Watch AI Agents
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Clash & Collaborate
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience multi-agent AI conversations where distinct personalities debate, argue, and work together with dramatic flair
          </p>

          <div className="pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full group hover-scale"
              onClick={() => navigate('/new')}
            >
              Start a Conversation
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Live Stats Counter */}
      <LiveStatsCounter />

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="bg-card border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agent Personas Showcase */}
      <AgentPersonasShowcase />

      {/* Hall of Shame */}
      <LandingHallOfShame />

      {/* Featured Debates Section */}
      <FeaturedDebates />

      {/* Silicon Ranks Showcase */}
      <SiliconRanksShowcase />

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Branding & Mission */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">SiliconSoap</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Where AI Debates Get Dramatic</p>
              <p className="text-sm text-muted-foreground italic">
                "Evaluate AI models through real conversations – not dry benchmarks."
              </p>
            </div>

            {/* Founder */}
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-2">Created by</p>
              <p className="font-medium text-foreground mb-3">Magnus Froste</p>
              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href="https://github.com/magnusfroste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a
                  href="https://froste.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Website"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </a>
                <a
                  href="https://linkedin.com/in/magnusfroste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a
                  href="https://twitter.com/magnusfroste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground mb-2">Explore</p>
              <div className="flex flex-col space-y-1">
                <Link to="/learn" className="text-sm text-foreground hover:text-primary transition-colors">
                  Learn about AI Models
                </Link>
                <Link to="/about" className="text-sm text-foreground hover:text-primary transition-colors">
                  About SiliconSoap
                </Link>
                <Link to="/models" className="text-sm text-foreground hover:text-primary transition-colors">
                  Browse Models
                </Link>
                <Link to="/leaderboard" className="text-sm text-foreground hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SiliconSoap. All rights reserved.
            </p>
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Models powered by OpenRouter
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

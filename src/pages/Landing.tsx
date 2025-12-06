import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Trophy, ArrowRight, Droplets, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 text-center relative z-10">
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

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20 md:pb-32">
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

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SiliconSoap. All rights reserved.
            </div>
            <Link 
              to="/learn" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Learn about AI models
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Sparkles, ArrowRight } from 'lucide-react';

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
      icon: Sparkles,
      title: 'Advanced Customization',
      description: 'Configure agents, models, conversation settings, and expert parameters for tailored experiences'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Agents Meetup
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
            Watch AI Agents
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Collaborate & Debate
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience multi-agent AI conversations where distinct personas work together to solve problems, explore ideas, and challenge perspectives
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
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI Agents Meetup. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

import { Settings, Zap, Lightbulb, UserRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const personas = [
  {
    id: 'analytical',
    name: 'Analytical Expert',
    description: 'Logical reasoning & evidence-based',
    icon: Settings,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'creative',
    name: 'Creative Thinker',
    description: 'Novel ideas & unconventional views',
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'strategic',
    name: 'Strategic Planner',
    description: 'Long-term goals & practical plans',
    icon: Lightbulb,
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'empathetic',
    name: 'Empathy Expert',
    description: 'Emotional intelligence & compassion',
    icon: UserRound,
    gradient: 'from-green-500 to-teal-500',
  },
];

export function AgentPersonasShowcase() {
  return (
    <section className="container mx-auto px-4 pb-20 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">
            Meet the Cast
          </h3>
          <p className="text-muted-foreground">
            Each AI agent brings a unique personality to the debate
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {personas.map((persona, index) => (
            <Card 
              key={persona.id}
              className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4 text-center">
                <div 
                  className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${persona.gradient} flex items-center justify-center mb-3`}
                >
                  <persona.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-sm mb-1">{persona.name}</h4>
                <p className="text-xs text-muted-foreground">{persona.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

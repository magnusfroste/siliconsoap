import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const SILICON_RANKS = [
  { level: 1, title: 'Silicon Seedling', emoji: '🌱', color: 'from-slate-400 to-slate-500' },
  { level: 2, title: 'Idea Spark', emoji: '💡', color: 'from-blue-400 to-cyan-400' },
  { level: 3, title: 'Debate Dynamo', emoji: '⚡', color: 'from-purple-500 to-pink-500' },
  { level: 4, title: 'Silicon Flame', emoji: '🔥', color: 'from-orange-500 to-red-500' },
  { level: 5, title: 'Silicon Legend', emoji: '💎', color: 'from-violet-500 via-pink-500 to-amber-500' },
];

export function SiliconRanksShowcase() {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 pb-16 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-2">
          Climb the Silicon Ladder
        </h3>
        <p className="text-muted-foreground mb-8">
          Share debates, earn views, unlock legendary status
        </p>
        
        <div className="flex justify-center items-center gap-2 md:gap-4 mb-8 flex-wrap">
          {SILICON_RANKS.map((rank, index) => (
            <div 
              key={rank.level}
              className="group flex flex-col items-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${rank.color} flex items-center justify-center text-2xl md:text-3xl shadow-lg hover:scale-125 hover:rotate-12 transition-all duration-300 cursor-default`}
                title={rank.title}
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${rank.color} blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300 -z-10`} />
                <span className="group-hover:animate-bounce">{rank.emoji}</span>
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground mt-2 max-w-[60px] md:max-w-[80px] text-center leading-tight group-hover:text-foreground transition-colors duration-300">
                {rank.title}
              </span>
            </div>
          ))}
        </div>

        <Button 
          variant="outline" 
          size="lg"
          className="group"
          onClick={() => navigate('/new')}
        >
          Start Your Journey
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
}

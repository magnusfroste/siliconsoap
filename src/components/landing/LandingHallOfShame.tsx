import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ShameMoment {
  id: string;
  agent_name: string;
  quote: string;
  shame_type: 'backstab' | 'diva' | 'trust_issue';
  severity: number;
  share_id: string | null;
  created_at: string;
}

const shameTypeConfig = {
  backstab: { 
    emoji: '🗡️', 
    label: 'Backstab', 
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' 
  },
  diva: { 
    emoji: '👑', 
    label: 'Diva Moment', 
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' 
  },
  trust_issue: { 
    emoji: '💔', 
    label: 'Trust Issue', 
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' 
  },
};

export function LandingHallOfShame() {
  const [moments, setMoments] = useState<ShameMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShameMoments();
  }, []);

  const fetchShameMoments = async () => {
    const { data, error } = await supabase
      .from('hall_of_shame')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching shame moments:', error);
    } else {
      setMoments((data as ShameMoment[]) || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (moments.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 pb-16 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <span>🎭</span>
            Hall of Shame
          </h3>
          <p className="text-sm text-muted-foreground italic">
            Can you trust an AI? Spoiler: no.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {moments.map((moment, index) => {
            const config = shameTypeConfig[moment.shame_type] || shameTypeConfig.backstab;
            return (
              <Card 
                key={moment.id} 
                className="bg-card/50 hover:bg-card/80 transition-all duration-300 border-border/50 hover:-translate-y-1 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => moment.share_id && navigate(`/shared/${moment.share_id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`${config.color} text-xs`}
                    >
                      {config.emoji} {config.label}
                    </Badge>
                    <div className="flex">
                      {[...Array(moment.severity)].map((_, i) => (
                        <span key={i} className="text-xs">🔥</span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium mb-2 line-clamp-3 italic">
                    "{moment.quote}"
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">
                      — Agent {moment.agent_name.split('-')[1]?.toUpperCase() || 'A'}
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

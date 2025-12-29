import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HallOfShameSkeleton } from '@/components/skeletons';
import { formatDistanceToNow } from 'date-fns';
import { getAgentSoapName, getAgentLetter } from '../utils/agentNameGenerator';

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

export function HallOfShame() {
  const [moments, setMoments] = useState<ShameMoment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShameMoments();
  }, []);

  const fetchShameMoments = async () => {
    const { data, error } = await supabase
      .from('hall_of_shame')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching shame moments:', error);
    } else {
      setMoments((data as ShameMoment[]) || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <HallOfShameSkeleton />;
  }

  if (moments.length === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            Hall of Shame
            <Badge variant="outline" className="ml-2 text-xs">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">No backstabs... yet.</p>
            <p className="text-sm italic">
              Judge Bot is collecting the most dramatic moments. The truth will be revealed soon! 👀
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            Hall of Shame
          </CardTitle>
          <p className="text-xs text-muted-foreground italic">
            Can you trust an AI? Spoiler: no.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {moments.map((moment) => {
            const config = shameTypeConfig[moment.shame_type] || shameTypeConfig.backstab;
            return (
              <Card 
                key={moment.id} 
                className="bg-card/50 hover:bg-card/80 transition-colors border-border/50"
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
                      — {getAgentSoapName(moment.agent_name, 'analytical')} ({getAgentLetter(moment.agent_name)})
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
      </CardContent>
    </Card>
  );
}

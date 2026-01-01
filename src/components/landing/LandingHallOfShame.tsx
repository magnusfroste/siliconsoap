import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

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

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export function LandingHallOfShame() {
  const [moments, setMoments] = useState<ShameMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const fetchShameMoments = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    }

    const { data, error } = await supabase
      .from('hall_of_shame')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching shame moments:', error);
    } else {
      const newMoments = (data as ShameMoment[]) || [];
      
      // Find new moments that weren't in the previous list
      if (isAutoRefresh && moments.length > 0) {
        const existingIds = new Set(moments.map(m => m.id));
        const newIds = newMoments.filter(m => !existingIds.has(m.id)).map(m => m.id);
        
        if (newIds.length > 0) {
          setAnimatingIds(new Set(newIds));
          // Clear animation state after animation completes
          setTimeout(() => setAnimatingIds(new Set()), 600);
        }
      }
      
      setMoments(newMoments);
    }
    
    setLoading(false);
    if (isAutoRefresh) {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [moments]);

  useEffect(() => {
    fetchShameMoments();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchShameMoments(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchShameMoments]);

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
            <RefreshCw 
              className={`h-4 w-4 text-muted-foreground transition-all duration-500 ${
                isRefreshing ? 'animate-spin text-primary' : 'opacity-0'
              }`}
            />
          </h3>
          <p className="text-sm text-muted-foreground italic">
            Can you trust an AI? Spoiler: no.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {moments.map((moment, index) => {
            const config = shameTypeConfig[moment.shame_type] || shameTypeConfig.backstab;
            const isNew = animatingIds.has(moment.id);
            
            return (
              <Card 
                key={moment.id} 
                className={`group bg-card/50 hover:bg-card/80 transition-all duration-300 border-border/50 hover:border-primary/30 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/5 cursor-pointer relative overflow-hidden ${
                  isNew 
                    ? 'animate-scale-in ring-2 ring-primary/50 ring-offset-2 ring-offset-background' 
                    : 'animate-fade-in'
                }`}
                style={{ animationDelay: isNew ? '0s' : `${index * 0.1}s` }}
                onClick={() => moment.share_id && navigate(`/shared/${moment.share_id}`)}
              >
                {/* New indicator pulse */}
                {isNew && (
                  <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                )}
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                
                <CardContent className="p-4 relative">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`${config.color} text-xs transition-transform duration-300 group-hover:scale-105`}
                    >
                      {config.emoji} {config.label}
                    </Badge>
                    <div className="flex">
                      {[...Array(moment.severity)].map((_, i) => (
                        <span key={i} className="text-xs">🔥</span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium mb-2 line-clamp-3 italic group-hover:text-foreground/90 transition-colors">
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

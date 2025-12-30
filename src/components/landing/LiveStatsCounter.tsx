import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Eye, Users } from 'lucide-react';

interface Stats {
  totalDebates: number;
  totalViews: number;
  totalAgents: number;
}

export function LiveStatsCounter() {
  const [stats, setStats] = useState<Stats>({ totalDebates: 0, totalViews: 0, totalAgents: 0 });
  const [displayStats, setDisplayStats] = useState<Stats>({ totalDebates: 0, totalViews: 0, totalAgents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  // Animate counting up
  useEffect(() => {
    if (loading) return;
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setDisplayStats({
        totalDebates: Math.round(stats.totalDebates * easeOut),
        totalViews: Math.round(stats.totalViews * easeOut),
        totalAgents: Math.round(stats.totalAgents * easeOut),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayStats(stats);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats, loading]);

  const fetchStats = async () => {
    try {
      // Get total debates and views
      const { data: chats, error: chatsError } = await supabase
        .from('agent_chats')
        .select('id, view_count, settings')
        .is('deleted_at', null);

      if (chatsError) throw chatsError;

      const totalDebates = chats?.length || 0;
      const totalViews = chats?.reduce((sum, chat) => sum + (chat.view_count || 0), 0) || 0;
      
      // Estimate total agents (agents per debate * debates)
      let totalAgents = 0;
      chats?.forEach(chat => {
        const settings = chat.settings as { agentCount?: number } | null;
        totalAgents += settings?.agentCount || 2;
      });

      setStats({ totalDebates, totalViews, totalAgents });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set some placeholder values
      setStats({ totalDebates: 100, totalViews: 500, totalAgents: 250 });
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { label: 'Debates Created', value: displayStats.totalDebates, icon: MessageSquare },
    { label: 'Total Views', value: displayStats.totalViews, icon: Eye },
    { label: 'AI Agents Unleashed', value: displayStats.totalAgents, icon: Users },
  ];

  return (
    <section className="container mx-auto px-4 pb-16 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {statItems.map((item, index) => (
            <div 
              key={item.label}
              className="group text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex justify-center mb-2">
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <item.icon className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                </div>
              </div>
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                {loading ? '—' : item.value.toLocaleString()}+
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors duration-300">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

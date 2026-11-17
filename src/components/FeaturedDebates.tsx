import { useNavigate } from 'react-router-dom';
import { useFeaturedDebates } from '@/hooks/useDebateStats';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageSquare, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeaturedDebatesGridSkeleton } from '@/components/skeletons';
import { Link } from 'react-router-dom';

export const FeaturedDebates = () => {
  const navigate = useNavigate();
  const { debates, loading } = useFeaturedDebates();

  if (loading) {
    return (
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-semibold">Trending Debates</h3>
          </div>
          <FeaturedDebatesGridSkeleton />
        </div>
      </section>
    );
  }

  if (debates.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-semibold">Trending Debates</h3>
          </div>
          <Link to="/explore">
            <Button variant="ghost" size="sm" className="group">
              View all
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {debates.map((debate, index) => (
            <Card 
              key={debate.id}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/shared/${debate.share_id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {debate.title}
                </h4>
                {index === 0 && (
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    🔥 Hot
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {debate.prompt}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{debate.real_view_count > 0 ? debate.real_view_count : 'New'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{debate.message_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{debate.agent_count} agents</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

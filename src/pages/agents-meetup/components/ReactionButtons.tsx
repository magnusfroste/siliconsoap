import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { trackReaction } from '@/utils/analytics';

interface ReactionButtonsProps {
  shareId: string;
}

type EmojiType = 'fire' | 'thinking' | 'lightbulb' | 'laughing';

const EMOJIS: { type: EmojiType; emoji: string; label: string }[] = [
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'thinking', emoji: '🤔', label: 'Thinking' },
  { type: 'lightbulb', emoji: '💡', label: 'Insightful' },
  { type: 'laughing', emoji: '😂', label: 'Funny' },
];

// Simple visitor ID for spam limiting (localStorage-based)
const getVisitorId = (): string => {
  const key = 'siliconsoap_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};

export const ReactionButtons = ({ shareId }: ReactionButtonsProps) => {
  const [counts, setCounts] = useState<Record<EmojiType, number>>({
    fire: 0,
    thinking: 0,
    lightbulb: 0,
    laughing: 0,
  });
  const [userReactions, setUserReactions] = useState<Set<EmojiType>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial counts
  useEffect(() => {
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from('chat_reactions')
        .select('emoji')
        .eq('share_id', shareId);

      if (error) {
        console.error('Error fetching reactions:', error);
        return;
      }

      const newCounts: Record<EmojiType, number> = {
        fire: 0,
        thinking: 0,
        lightbulb: 0,
        laughing: 0,
      };

      data?.forEach((r) => {
        const emoji = r.emoji as EmojiType;
        if (emoji in newCounts) {
          newCounts[emoji]++;
        }
      });

      setCounts(newCounts);

      // Check which reactions this visitor has made
      const visitorId = getVisitorId();
      const { data: userReactionsData } = await supabase
        .from('chat_reactions')
        .select('emoji')
        .eq('share_id', shareId)
        .eq('visitor_id', visitorId);

      if (userReactionsData) {
        setUserReactions(new Set(userReactionsData.map((r) => r.emoji as EmojiType)));
      }
    };

    fetchCounts();
  }, [shareId]);

  // Real-time subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel(`reactions-${shareId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_reactions',
          filter: `share_id=eq.${shareId}`,
        },
        (payload) => {
          const emoji = payload.new.emoji as EmojiType;
          setCounts((prev) => ({
            ...prev,
            [emoji]: prev[emoji] + 1,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shareId]);

  const handleReaction = async (emojiType: EmojiType) => {
    // Check if user already reacted with this emoji
    if (userReactions.has(emojiType)) {
      toast.info('You already reacted with this emoji!');
      return;
    }

    setIsLoading(true);

    try {
      const visitorId = getVisitorId();

      const { error } = await supabase.from('chat_reactions').insert({
        share_id: shareId,
        emoji: emojiType,
        visitor_id: visitorId,
      });

      if (error) {
        console.error('Error adding reaction:', error);
        toast.error('Failed to add reaction');
        return;
      }

      // Track in GA
      trackReaction({ shareId, emoji: emojiType });
      // Update local state
      setUserReactions((prev) => new Set([...prev, emojiType]));
      // Count will be updated via real-time subscription
    } catch (err) {
      console.error('Error adding reaction:', err);
      toast.error('Failed to add reaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {EMOJIS.map(({ type, emoji, label }) => {
        const count = counts[type];
        const hasReacted = userReactions.has(type);

        return (
          <Button
            key={type}
            variant="outline"
            size="sm"
            onClick={() => handleReaction(type)}
            disabled={isLoading || hasReacted}
            title={label}
            className={cn(
              'gap-1.5 transition-all duration-200',
              hasReacted && 'bg-primary/10 border-primary/50',
              count > 0 && 'pr-2.5'
            )}
          >
            <span className="text-base">{emoji}</span>
            {count > 0 && (
              <span className={cn(
                'text-xs font-medium tabular-nums',
                hasReacted ? 'text-primary' : 'text-muted-foreground'
              )}>
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

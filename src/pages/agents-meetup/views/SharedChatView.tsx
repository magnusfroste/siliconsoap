import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSharedChat } from '../hooks/useSharedChat';
import { ChatMessage } from '../components/ChatMessage';
import { RoundSeparator } from '../components/RoundSeparator';
import { SocialShareButtons } from '../components/SocialShareButtons';
import { ReactionButtons } from '../components/ReactionButtons';
import { Button } from '@/components/ui/button';
import { Droplets, ArrowRight, Trash2, Lock, Eye, MessageSquare, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const SharedChatView = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { chat, messages, loading, error } = useSharedChat(shareId);
  const viewTrackedRef = useRef(false);

  // Track view count once
  useEffect(() => {
    if (shareId && !viewTrackedRef.current) {
      viewTrackedRef.current = true;
      supabase.rpc('increment_chat_view_count', { p_share_id: shareId });
    }
  }, [shareId]);

  // Dynamic meta tags for OG
  useEffect(() => {
    if (chat) {
      // Update document title
      document.title = `${chat.title} | SiliconSoap`;
      
      // Update meta tags dynamically
      updateMetaTag('og:title', chat.title);
      updateMetaTag('og:description', chat.prompt);
      updateMetaTag('og:url', window.location.href);
      updateMetaTag('og:image', getOgImageUrl(shareId || ''));
      updateMetaTag('twitter:title', chat.title);
      updateMetaTag('twitter:description', chat.prompt);
      updateMetaTag('twitter:image', getOgImageUrl(shareId || ''));
    }

    return () => {
      // Reset on unmount
      document.title = 'SiliconSoap - Where AI Debates Get Dramatic';
    };
  }, [chat, shareId]);

  const getOgImageUrl = (shareId: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/generate-og-image?shareId=${shareId}`;
  };

  const shareUrl = window.location.href;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading shared conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !chat) {
    const errorConfig = {
      deleted: {
        icon: Trash2,
        title: 'Chat Removed',
        description: 'This conversation has been deleted by the owner.'
      },
      not_public: {
        icon: Lock,
        title: 'Private Chat',
        description: "This chat hasn't been shared publicly."
      },
      not_found: {
        icon: Droplets,
        title: 'Chat Not Found',
        description: 'This link appears to be invalid.'
      }
    };

    const config = error ? errorConfig[error] : errorConfig.not_found;
    const Icon = config.icon;

    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 max-w-md">
          <Icon className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">{config.title}</h2>
          <p className="text-muted-foreground">{config.description}</p>
          <Button onClick={() => navigate('/')}>
            Start Your Own Conversation
          </Button>
        </div>
      </div>
    );
  }

  // Group messages by round
  const messagesByRound: { [key: number]: typeof messages } = {};
  messages.forEach((msg: any) => {
    const round = msg.round || 1;
    if (!messagesByRound[round]) {
      messagesByRound[round] = [];
    }
    messagesByRound[round].push(msg);
  });

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-primary" />
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-lg font-semibold">{chat.title}</h1>
                  <p className="text-xs text-muted-foreground">Shared via SiliconSoap</p>
                </div>
                {(() => {
                  const settings = chat.settings as any;
                  const mode = settings?.participationMode || 'jump-in';
                  const modeConfig = {
                    'spectator': { 
                      label: 'Spectator', 
                      icon: Eye, 
                      variant: 'secondary' as const,
                      tooltip: 'Watch only mode. Agents completed all rounds automatically.'
                    },
                    'jump-in': { 
                      label: 'Jump In', 
                      icon: MessageSquare, 
                      variant: 'default' as const,
                      tooltip: 'Comment mode. The creator could add thoughts after agents finished.'
                    },
                    'round-by-round': { 
                      label: 'Round by Round', 
                      icon: Users, 
                      variant: 'outline' as const,
                      tooltip: 'Interactive mode. The creator could participate between rounds.'
                    }
                  };
                  const config = modeConfig[mode as keyof typeof modeConfig] || modeConfig['jump-in'];
                  const Icon = config.icon;
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant={config.variant} className="shrink-0 gap-1.5 cursor-help">
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p>{config.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Social Share Buttons */}
              <SocialShareButtons 
                url={shareUrl} 
                title={chat.title}
                description={chat.prompt}
              />
              
              <Button onClick={() => navigate('/')} className="gap-2">
                Start Your Own
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1">
        <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Original Prompt */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <p className="text-sm text-muted-foreground mb-1">Original Prompt</p>
            <p className="text-foreground">{chat.prompt}</p>
          </div>

          {/* Reaction Buttons */}
          {shareId && (
            <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-lg border bg-muted/10">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">React to this debate:</span>
              </div>
              <ReactionButtons shareId={shareId} />
            </div>
          )}
          {/* Messages by Round */}
          {Object.entries(messagesByRound)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([roundStr, roundMessages], roundIndex) => {
              const round = Number(roundStr);
              return (
                <div key={round} className="space-y-4">
                  {roundIndex > 0 && <RoundSeparator roundNumber={round} />}
                  {roundMessages.map((message: any) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      messageIndex={messages.indexOf(message)}
                      totalMessages={messages.length}
                      chatUrl={shareUrl}
                      showQuoteShare={true}
                    />
                  ))}
                </div>
              );
            })}
        </div>
      </ScrollArea>

      {/* CTA Footer */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground mb-3">
            Want to create your own multi-agent conversations?
          </p>
          <Button onClick={() => navigate('/')} size="lg" className="gap-2">
            <Droplets className="h-4 w-4" />
            Start Free Conversation
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper to update meta tags
function updateMetaTag(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
  }
  if (meta) {
    meta.setAttribute('content', content);
  } else {
    meta = document.createElement('meta');
    if (property.startsWith('og:')) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }
}

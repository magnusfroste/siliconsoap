import { useParams, useNavigate } from 'react-router-dom';
import { useSharedChat } from '../hooks/useSharedChat';
import { ChatMessage } from '../components/ChatMessage';
import { RoundSeparator } from '../components/RoundSeparator';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Trash2, Lock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const SharedChatView = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { chat, messages, loading, error } = useSharedChat(shareId);

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
        icon: Sparkles,
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
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">{chat.title}</h1>
              <p className="text-xs text-muted-foreground">Shared via Agents Meetup</p>
            </div>
          </div>
          <Button onClick={() => navigate('/')} className="gap-2">
            Start Your Own
            <ArrowRight className="h-4 w-4" />
          </Button>
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
            <Sparkles className="h-4 w-4" />
            Start Free Conversation
          </Button>
        </div>
      </div>
    </div>
  );
};

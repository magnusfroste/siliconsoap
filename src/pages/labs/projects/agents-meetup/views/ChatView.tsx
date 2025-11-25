import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useLabsState } from '../hooks/useLabsState';
import { Loader2 } from 'lucide-react';

export const ChatView = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chat, messages, loading } = useChat(chatId, user?.id);
  const [state] = useLabsState();

  useEffect(() => {
    // Wait for auth to finish loading before making any decisions
    if (loading) return;
    
    // Redirect to auth if not logged in
    if (!user) {
      navigate('/auth', { state: { from: { pathname: `/labs/agents-meetup/chat/${chatId}` } } });
    }
  }, [user, loading, chatId, navigate]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Chat not found</p>
          <p className="text-sm text-muted-foreground">
            This chat may have been deleted or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Title */}
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold truncate">{chat.title}</h2>
        <p className="text-sm text-muted-foreground truncate">{chat.prompt}</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-4xl mx-auto py-6 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

          {state.isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Agents are thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput 
        onSend={(message) => {
          // TODO: Implement follow-up conversation logic
          console.log('Follow-up:', message);
        }}
        disabled={state.isLoading}
        placeholder="Continue the conversation..."
      />
    </div>
  );
};

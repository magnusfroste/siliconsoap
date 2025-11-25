import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useChatHistory } from '../hooks/useChatHistory';
import { ChatHistoryItem } from '../components/ChatHistoryItem';

interface ChatSidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  user: User | null;
}

export const ChatSidebar = ({ onClose, collapsed = false, onToggleCollapse, user }: ChatSidebarProps) => {
  const { chats, loading, deleteChat } = useChatHistory(user?.id);

  // Group chats by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayChats = chats.filter(chat => {
    const chatDate = new Date(chat.created_at);
    return chatDate.toDateString() === today.toDateString();
  });

  const yesterdayChats = chats.filter(chat => {
    const chatDate = new Date(chat.created_at);
    return chatDate.toDateString() === yesterday.toDateString();
  });

  const olderChats = chats.filter(chat => {
    const chatDate = new Date(chat.created_at);
    return chatDate < yesterday;
  });

  if (collapsed) {
    return (
      <div className="flex flex-col h-full bg-muted/30 border-r items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="mb-4"
          title="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Link to="/labs/agents-meetup">
          <Button variant="ghost" size="icon" onClick={onClose} title="New Chat">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/30 border-r">
      {/* Header */}
      <div className="p-4 border-b space-y-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <Link to="/labs/agents-meetup">
          <Button className="w-full justify-start gap-2" onClick={onClose}>
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-2">
        {user ? (
          <>
            {loading ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                Loading chats...
              </div>
            ) : chats.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No saved chats yet
              </div>
            ) : (
              <div className="space-y-4">
                {todayChats.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">TODAY</h3>
                    <div className="space-y-1">
                      {todayChats.map(chat => (
                        <ChatHistoryItem key={chat.id} chat={chat} onDelete={deleteChat} />
                      ))}
                    </div>
                  </div>
                )}

                {yesterdayChats.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">YESTERDAY</h3>
                    <div className="space-y-1">
                      {yesterdayChats.map(chat => (
                        <ChatHistoryItem key={chat.id} chat={chat} onDelete={deleteChat} />
                      ))}
                    </div>
                  </div>
                )}

                {olderChats.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">OLDER</h3>
                    <div className="space-y-1">
                      {olderChats.map(chat => (
                        <ChatHistoryItem key={chat.id} chat={chat} onDelete={deleteChat} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8 px-4">
            Sign in to save and access your conversation history
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {!user && (
        <div className="p-4 border-t">
          <Link to="/auth">
            <Button variant="outline" className="w-full justify-start gap-2">
              <LogIn className="h-4 w-4" />
              Sign In to Save Chats
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

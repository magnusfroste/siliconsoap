import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, LogIn, PanelLeftClose, PanelLeft, User as UserIcon, Bot, Key, Settings, Atom, Ticket } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useChatHistory } from '../hooks/useChatHistory';
import { useCredits } from '../hooks/useCredits';
import { ChatHistoryItem } from '../components/ChatHistoryItem';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  user: User | null;
}

export const ChatSidebar = ({ onClose, collapsed = false, onToggleCollapse, user }: ChatSidebarProps) => {
  const { chats, loading, deleteChat } = useChatHistory(user?.id);
  const { creditsRemaining, isGuest } = useCredits(user?.id);
  const location = useLocation();

  const navItems = [
    { icon: UserIcon, label: 'Profile', path: '/profile', requiresAuth: true },
    { icon: Bot, label: 'Agent Profiles', path: '/agent-profiles', requiresAuth: true },
    { icon: Key, label: 'API Settings', path: '/api-settings', requiresAuth: true },
    { icon: Settings, label: 'Settings', path: '/settings', requiresAuth: true },
  ];

  // Filter nav items based on authentication status
  const filteredNavItems = navItems.filter(item => !item.requiresAuth || user);

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
      <div className="flex flex-col h-full bg-muted/30 border-r items-center py-4 gap-2">
        <Link to="/" className="mb-2" onClick={onClose}>
          <Button variant="ghost" size="icon" title="Agents Meetup">
            <Atom className="h-5 w-5 text-primary" />
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          title="Expand sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        
        <div className="h-px w-8 bg-border my-2" />
        
        <Link to="/" onClick={onClose}>
          <Button variant="ghost" size="icon" title="New Chat">
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
        
        <div className="flex-1" />
        
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} onClick={onClose}>
                <Button variant="ghost" size="icon" title={item.label}>
                  <Icon className="h-4 w-4" />
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/30 border-r">
      {/* Branding */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <Atom className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Agents Meetup</span>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="shrink-0"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 p-2">
        <Link to="/" className="block mb-3">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={onClose}>
            <Plus className="h-4 w-4" />
            <span className="text-sm">New Chat</span>
          </Button>
        </Link>
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

      {/* Footer Navigation */}
      <div className="border-t">
        {/* Credits Display */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 text-sm">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Credits:</span>
            <Badge variant={creditsRemaining > 3 ? "secondary" : "destructive"}>
              {creditsRemaining}
            </Badge>
          </div>
          {isGuest && creditsRemaining > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Sign up for {10 - creditsRemaining} more credits
            </p>
          )}
        </div>

        <Separator />
        <div className="p-2 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={onClose}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-muted text-primary font-medium"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {!user && (
          <div className="p-2 pt-0">
            <Separator className="mb-2" />
            <Link to="/auth">
              <Button variant="outline" className="w-full justify-start gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

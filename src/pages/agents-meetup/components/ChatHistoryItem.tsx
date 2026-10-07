import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatHistoryItem as ChatHistoryType } from '../hooks/useChatHistory';

interface ChatHistoryItemProps {
  chat: ChatHistoryType;
  onDelete: (id: string) => void;
}

export const ChatHistoryItem = ({ chat, onDelete }: ChatHistoryItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === `/chat/${chat.id}`;
  const [live, setLive] = useState(false);
  useEffect(() => {
    const update = (event: Event) => {
      const detail = (event as CustomEvent<{ chatId?: string; live: boolean }>).detail;
      if (detail.chatId === chat.id) setLive(detail.live);
    };
    window.addEventListener('debateLiveStatus', update);
    return () => window.removeEventListener('debateLiveStatus', update);
  }, [chat.id]);

  return (
    <div className={`group relative rounded-md ${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`}>
      <Link
        to={`/chat/${chat.id}`}
        className="flex items-center gap-2 p-2 pr-8"
      >
        <div className="min-w-0 flex-1"><span className="line-clamp-2 text-sm font-medium">{chat.title}</span><span className={`mt-1 block text-xs ${isActive && live ? 'text-primary' : 'text-muted-foreground'}`}>{isActive && live ? 'Live now' : chat.is_shared ? 'Public' : new Date(chat.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete debate"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          onDelete(chat.id);
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};

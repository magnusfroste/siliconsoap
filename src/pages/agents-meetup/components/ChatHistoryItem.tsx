import { Link, useParams } from 'react-router-dom';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatHistoryItem as ChatHistoryType } from '../hooks/useChatHistory';

interface ChatHistoryItemProps {
  chat: ChatHistoryType;
  onDelete: (id: string) => void;
}

export const ChatHistoryItem = ({ chat, onDelete }: ChatHistoryItemProps) => {
  const { chatId } = useParams();
  const isActive = chatId === chat.id;

  return (
    <div className={`group relative rounded-md ${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`}>
      <Link
        to={`/chat/${chat.id}`}
        className="flex items-center gap-2 p-2 pr-8"
      >
        <MessageSquare className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm truncate flex-1">{chat.title}</span>
      </Link>
      <Button
        variant="ghost"
        size="icon"
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

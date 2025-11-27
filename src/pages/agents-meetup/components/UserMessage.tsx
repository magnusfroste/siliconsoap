import { ConversationMessage } from '../types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserMessageProps {
  message: ConversationMessage;
  messageIndex: number;
  totalMessages: number;
  showTimeline?: boolean;
}

export const UserMessage = ({ message, messageIndex, totalMessages, showTimeline = true }: UserMessageProps) => {
  const isLastMessage = messageIndex === totalMessages - 1;

  return (
    <div className="relative pl-8 animate-fade-in" style={{ animationDelay: `${messageIndex * 0.1}s` }}>
      {/* Timeline Connector */}
      {showTimeline && (
        <>
          {/* Vertical Line */}
          {!isLastMessage && (
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border -translate-x-1/2" />
          )}
          
          {/* Colored Dot for User */}
          <div className="absolute left-4 top-4 w-2 h-2 rounded-full bg-orange-400 -translate-x-1/2 z-10" />
        </>
      )}

      {/* User Message Card */}
      <Card className="border-2 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 px-4 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* User Avatar */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
              <User className="w-4 h-4" />
            </div>
            <span className="font-semibold">You</span>
            
            {/* Turn Order Badge */}
            <Badge variant="outline" className="text-xs">
              #{messageIndex + 1}
            </Badge>
            
            <Badge variant="secondary" className="text-xs">
              Human Participant
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-4 pt-0">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.message}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

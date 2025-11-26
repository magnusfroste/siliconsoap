import { ConversationMessage } from '../types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AgentAvatar } from '@/components/labs/agent-card/AgentAvatar';
import { Badge } from '@/components/ui/badge';

interface ChatMessageProps {
  message: ConversationMessage;
  messageIndex: number;
  totalMessages: number;
  showTimeline?: boolean;
}

const agentStyles = {
  'Agent A': { 
    borderClass: 'border-purple-200', 
    iconBgClass: 'bg-purple-100 text-purple-700',
    timelineDotClass: 'bg-purple-400'
  },
  'Agent B': { 
    borderClass: 'border-blue-200', 
    iconBgClass: 'bg-blue-100 text-blue-700',
    timelineDotClass: 'bg-blue-400'
  },
  'Agent C': { 
    borderClass: 'border-green-200', 
    iconBgClass: 'bg-green-100 text-green-700',
    timelineDotClass: 'bg-green-400'
  }
};

export const ChatMessage = ({ message, messageIndex, totalMessages, showTimeline = true }: ChatMessageProps) => {
  const style = agentStyles[message.agent as keyof typeof agentStyles] || {
    borderClass: 'border-border',
    iconBgClass: 'bg-muted text-foreground',
    timelineDotClass: 'bg-muted-foreground'
  };

  const agentLetter = message.agent.replace('Agent ', '') as 'A' | 'B' | 'C';
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
          
          {/* Colored Dot */}
          <div className={`absolute left-4 top-4 w-2 h-2 rounded-full ${style.timelineDotClass} -translate-x-1/2 z-10`} />
        </>
      )}

      {/* Message Card */}
      <Card className={`border-2 ${style.borderClass} shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-2 px-4 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <AgentAvatar agentLetter={agentLetter} iconBgClass={style.iconBgClass} />
            <span className="font-semibold">{message.agent}</span>
            
            {/* Turn Order Badge */}
            <Badge variant="outline" className="text-xs">
              #{messageIndex + 1}
            </Badge>
            
            <span className="text-xs text-muted-foreground">· {message.model}</span>
            
            {/* Persona Badge */}
            <Badge variant="secondary" className="text-xs">
              {message.persona}
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

import { ConversationMessage } from '../types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AgentAvatar } from '@/components/labs/agent-card/AgentAvatar';
import { Badge } from '@/components/ui/badge';
import { QuoteShareButton } from './QuoteShareButton';
import { getAgentSoapName, getAgentLetter } from '../utils/agentNameGenerator';

interface ChatMessageProps {
  message: ConversationMessage;
  messageIndex: number;
  totalMessages: number;
  showTimeline?: boolean;
  isPlaying?: boolean;
  chatUrl?: string;
  showQuoteShare?: boolean;
}

const agentStyles = {
  'Agent A': { 
    borderClass: 'border-purple-200 dark:border-purple-700', 
    iconBgClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    timelineDotClass: 'bg-purple-400 dark:bg-purple-600'
  },
  'Agent B': { 
    borderClass: 'border-blue-200 dark:border-blue-700', 
    iconBgClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    timelineDotClass: 'bg-blue-400 dark:bg-blue-600'
  },
  'Agent C': { 
    borderClass: 'border-green-200 dark:border-green-700', 
    iconBgClass: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    timelineDotClass: 'bg-green-400 dark:bg-green-600'
  }
};

export const ChatMessage = ({ 
  message, 
  messageIndex, 
  totalMessages, 
  showTimeline = true, 
  isPlaying = false,
  chatUrl,
  showQuoteShare = false
}: ChatMessageProps) => {
  const style = agentStyles[message.agent as keyof typeof agentStyles] || {
    borderClass: 'border-border',
    iconBgClass: 'bg-muted text-foreground',
    timelineDotClass: 'bg-muted-foreground'
  };

  const agentLetter = getAgentLetter(message.agent) as 'A' | 'B' | 'C';
  const soapName = getAgentSoapName(message.agent, message.persona);
  const isLastMessage = messageIndex === totalMessages - 1;

  return (
    <div className="relative pl-8 animate-fade-in group" style={{ animationDelay: `${messageIndex * 0.1}s` }}>
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
      <Card className={`border-2 ${style.borderClass} shadow-sm hover:shadow-md transition-all duration-300 ${isPlaying ? 'ring-2 ring-primary shadow-xl scale-[1.02]' : ''}`}>
        <CardHeader className="pb-2 px-4 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <AgentAvatar agentLetter={agentLetter} iconBgClass={style.iconBgClass} />
            <span className="font-semibold">{soapName}</span>
            <span className="text-xs text-muted-foreground">({agentLetter})</span>
            
            {/* Turn Order Badge */}
            <Badge variant="outline" className="text-xs">
              #{messageIndex + 1}
            </Badge>
            
            <span className="text-xs text-muted-foreground">· {message.model}</span>
            
            {/* Persona Badge */}
            <Badge variant="secondary" className="text-xs">
              {message.persona}
            </Badge>

            {/* Quote Share Button */}
            {showQuoteShare && (
              <div className="ml-auto">
                <QuoteShareButton message={message} chatUrl={chatUrl} />
              </div>
            )}
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

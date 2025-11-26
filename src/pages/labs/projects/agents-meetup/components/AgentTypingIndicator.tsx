import { AgentAvatar } from '@/components/labs/agent-card/AgentAvatar';
import { Card } from '@/components/ui/card';

interface AgentTypingIndicatorProps {
  agentName: string;
}

const agentStyles = {
  'Agent A': { 
    borderClass: 'border-purple-200', 
    iconBgClass: 'bg-purple-100 text-purple-700',
    bgClass: 'bg-purple-50/50'
  },
  'Agent B': { 
    borderClass: 'border-blue-200', 
    iconBgClass: 'bg-blue-100 text-blue-700',
    bgClass: 'bg-blue-50/50'
  },
  'Agent C': { 
    borderClass: 'border-green-200', 
    iconBgClass: 'bg-green-100 text-green-700',
    bgClass: 'bg-green-50/50'
  }
};

export const AgentTypingIndicator = ({ agentName }: AgentTypingIndicatorProps) => {
  const style = agentStyles[agentName as keyof typeof agentStyles] || {
    borderClass: 'border-border',
    iconBgClass: 'bg-muted text-foreground',
    bgClass: 'bg-muted/50'
  };

  const agentLetter = agentName.replace('Agent ', '') as 'A' | 'B' | 'C';

  return (
    <div className="relative pl-8 animate-fade-in">
      {/* Timeline Dot */}
      <div className="absolute left-4 top-4 w-2 h-2 rounded-full bg-muted-foreground/40 -translate-x-1/2 z-10 animate-pulse" />
      
      <Card className={`border-2 ${style.borderClass} ${style.bgClass} shadow-sm`}>
        <div className="px-4 py-3 flex items-center gap-3">
          <AgentAvatar agentLetter={agentLetter} iconBgClass={style.iconBgClass} />
          
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{agentName}</span>
            <span className="text-xs text-muted-foreground">is thinking</span>
          </div>
          
          {/* Animated Dots */}
          <div className="flex gap-1 ml-2">
            <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </Card>
    </div>
  );
};

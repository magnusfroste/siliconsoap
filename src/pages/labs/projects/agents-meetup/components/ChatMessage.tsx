import { ConversationMessage } from '../types';

interface ChatMessageProps {
  message: ConversationMessage;
}

const agentColors = {
  'Agent A': 'bg-purple-100 border-purple-200 text-purple-900',
  'Agent B': 'bg-blue-100 border-blue-200 text-blue-900',
  'Agent C': 'bg-green-100 border-green-200 text-green-900'
};

const agentIcons = {
  'Agent A': '🟣',
  'Agent B': '🔵',
  'Agent C': '🟢'
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const colorClass = agentColors[message.agent as keyof typeof agentColors] || 'bg-muted border-border text-foreground';
  const icon = agentIcons[message.agent as keyof typeof agentIcons] || '🤖';

  return (
    <div className={`rounded-lg border p-4 ${colorClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="font-semibold">{message.agent}</span>
        <span className="text-xs opacity-70">· {message.model}</span>
        <span className="text-xs opacity-70">· {message.persona}</span>
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {message.message}
      </div>
    </div>
  );
};

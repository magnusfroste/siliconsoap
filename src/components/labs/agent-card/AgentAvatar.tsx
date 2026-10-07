
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AgentAvatarProps {
  agentLetter: 'A' | 'B' | 'C';
  iconBgClass?: string;
  name?: string;
  size?: 'sm' | 'md';
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ agentLetter, iconBgClass, name, size = 'sm' }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : agentLetter;

  return (
    <Avatar className={`${size === 'md' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs'} ${iconBgClass || ''}`}>
      <AvatarFallback className={`${iconBgClass || { A: 'bg-agent-a-bg text-agent-a-fg', B: 'bg-agent-b-bg text-agent-b-fg', C: 'bg-agent-c-bg text-agent-c-fg' }[agentLetter]} font-semibold`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

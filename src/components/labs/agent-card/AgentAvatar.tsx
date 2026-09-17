
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
      <AvatarFallback className={`${iconBgClass || `bg-agent-${agentLetter.toLowerCase()}-bg text-agent-${agentLetter.toLowerCase()}-fg`} font-semibold`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};


import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AgentAvatarProps {
  agentLetter: 'A' | 'B' | 'C';
  iconBgClass: string;
  name?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ agentLetter, iconBgClass, name }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : agentLetter;

  return (
    <Avatar className={`h-8 w-8 ${iconBgClass}`}>
      <AvatarFallback className={`${iconBgClass} text-xs font-semibold`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

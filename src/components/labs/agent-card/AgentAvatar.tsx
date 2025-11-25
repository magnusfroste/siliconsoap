
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AgentAvatarProps {
  agentLetter: 'A' | 'B' | 'C';
  iconBgClass: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ agentLetter, iconBgClass }) => {
  return (
    <Avatar className={`h-8 w-8 ${iconBgClass}`}>
      <AvatarFallback className={`${iconBgClass} text-xs font-semibold`}>
        {agentLetter}
      </AvatarFallback>
    </Avatar>
  );
};

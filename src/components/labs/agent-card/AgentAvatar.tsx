
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AgentAvatarProps {
  agentLetter: 'A' | 'B' | 'C';
  iconBgClass: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ agentLetter, iconBgClass }) => {
  const getAgentAvatarSrc = () => {
    switch (agentLetter) {
      case 'A':
        return '/placeholder2.svg';
      case 'B':
        return '/placeholder2.svg';
      case 'C':
        return '/placeholder2.svg';
      default:
        return '';
    }
  };

  return (
    <Avatar className={`h-8 w-8 ${iconBgClass}`}>
      <AvatarImage src={getAgentAvatarSrc()} alt={`Agent ${agentLetter}`} />
      <AvatarFallback className={`${iconBgClass} text-xs`}>{agentLetter}</AvatarFallback>
    </Avatar>
  );
};

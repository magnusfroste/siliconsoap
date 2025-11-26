import { Settings, Zap, Target, Heart } from 'lucide-react';
import { ReactNode } from 'react';

export const iconMap: Record<string, ReactNode> = {
  Settings: <Settings className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
};

export const getIconComponent = (iconName: string): ReactNode => {
  return iconMap[iconName] || <Settings className="h-5 w-5" />;
};

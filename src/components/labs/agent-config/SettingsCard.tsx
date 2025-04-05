
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface SettingsCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  icon = <Zap className="h-4 w-4 text-purple-600" />,
  children
}) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

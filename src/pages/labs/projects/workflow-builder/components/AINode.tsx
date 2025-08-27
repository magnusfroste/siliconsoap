import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AINodeData {
  label?: string;
  model?: string;
  hasCredentials?: boolean;
}

const AINode = memo(({ data }: { data: AINodeData }) => {
  return (
    <Card className="min-w-[220px] p-4 border-2 border-secondary/20 bg-background">
      <Handle type="target" position={Position.Left} className="!bg-secondary" />
      
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-secondary" />
        <span className="font-medium text-sm">AI Model</span>
        <Settings className="h-3 w-3 text-muted-foreground ml-auto" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Model:</span>
          <Badge variant="outline" className="text-xs">
            {data.model || 'gpt-4'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Credentials:</span>
          <Badge 
            variant={data.hasCredentials ? "default" : "destructive"} 
            className="text-xs"
          >
            {data.hasCredentials ? 'Connected' : 'Required'}
          </Badge>
        </div>
        
        <div className="bg-muted/50 p-2 rounded text-xs">
          Processes input with AI model
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-secondary" />
    </Card>
  );
});

AINode.displayName = 'AINode';

export default AINode;
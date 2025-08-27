import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play, Square } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RunNodeData {
  label?: string;
  isRunning?: boolean;
}

const RunNode = memo(({ data }: { data: RunNodeData }) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    // Simulate execution time
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  return (
    <Card className="min-w-[180px] p-4 border-2 border-accent/20 bg-background">
      <Handle type="target" position={Position.Left} className="!bg-accent" />
      
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Square className="h-4 w-4 text-accent animate-pulse" />
          ) : (
            <Play className="h-4 w-4 text-accent" />
          )}
          <span className="font-medium text-sm">Run Workflow</span>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mb-3">
        Execute the workflow
      </div>
      
      <Button 
        size="sm" 
        onClick={handleRun}
        disabled={isRunning}
        className="w-full"
        variant={isRunning ? "secondary" : "default"}
      >
        {isRunning ? 'Running...' : 'Execute'}
      </Button>
      
      <Handle type="source" position={Position.Right} className="!bg-accent" />
    </Card>
  );
});

RunNode.displayName = 'RunNode';

export default RunNode;
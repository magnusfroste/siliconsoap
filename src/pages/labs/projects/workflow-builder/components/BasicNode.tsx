import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';

interface BasicNodeData {
  label?: string;
}

const BasicNode = memo(({ data }: { data: BasicNodeData }) => {
  console.log('BasicNode rendering with data:', data);
  
  return (
    <Card className="min-w-[200px] p-4 border-2 bg-background">
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      
      <div className="text-center">
        <div className="font-medium text-sm mb-2">Basic Node</div>
        <div className="text-xs text-muted-foreground">
          {data.label || 'Basic workflow node'}
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </Card>
  );
});

BasicNode.displayName = 'BasicNode';

export default BasicNode;
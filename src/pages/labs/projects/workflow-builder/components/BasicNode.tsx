import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';

interface BasicNodeData {
  label?: string;
}

const BasicNode = memo(({ data }: { data: BasicNodeData }) => {
  console.log('BasicNode rendering with data:', data);
  
  return (
    <div className="relative bg-white border-2 border-gray-300 rounded-lg p-4 min-w-[200px] shadow-sm">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" 
      />
      
      <div className="text-center">
        <div className="font-medium text-sm mb-2 text-gray-800">Basic Node</div>
        <div className="text-xs text-gray-600">
          {data.label || 'Basic workflow node'}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" 
      />
    </div>
  );
});

BasicNode.displayName = 'BasicNode';

export default BasicNode;
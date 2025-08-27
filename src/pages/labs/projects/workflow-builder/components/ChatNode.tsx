import React, { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Play, X } from 'lucide-react';

interface ChatNodeData {
  label?: string;
  message?: string;
  isExecuting?: boolean;
  isExecuted?: boolean;
}

const ChatNode = memo(({ data, id }: { data: ChatNodeData; id: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { setNodes } = useReactFlow();

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const getNodeStyle = () => {
    if (data.isExecuted) return "border-2 border-green-500 bg-background shadow-lg";
    if (data.isExecuting) return "border-2 border-yellow-500 bg-background shadow-lg animate-pulse";
    return "border-2 border-gray-300 bg-background hover:border-gray-400 transition-colors";
  };

  const getHandleStyle = () => {
    if (data.isExecuted) return "!bg-green-500";
    if (data.isExecuting) return "!bg-yellow-500";
    return "!bg-gray-400";
  };

  return (
    <div 
      className={`min-w-[180px] p-4 rounded-lg relative ${getNodeStyle()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <Handle type="target" position={Position.Left} className={getHandleStyle()} />
      
      <div className="flex items-center justify-center mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <Play className="h-5 w-5 text-gray-600" />
        </div>
      </div>
      
      <div className="text-center">
        <div className="font-medium text-sm mb-1">
          {data.label || "When clicking 'Execute workflow'"}
        </div>
        <div className="text-xs text-muted-foreground">
          Manual trigger
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className={getHandleStyle()} />
    </div>
  );
});

ChatNode.displayName = 'ChatNode';

export default ChatNode;
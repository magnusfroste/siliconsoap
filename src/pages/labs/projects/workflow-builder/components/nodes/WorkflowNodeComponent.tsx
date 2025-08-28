import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import { WorkflowNode, ExecutionStatus } from '../../types';
import { NODE_DEFINITIONS } from '../../constants/nodeDefinitions';

interface WorkflowNodeComponentProps {
  data: WorkflowNode;
  selected?: boolean;
}

const getStatusColor = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.RUNNING:
      return 'bg-blue-500/20 border-blue-500';
    case ExecutionStatus.SUCCESS:
      return 'bg-green-500/20 border-green-500';
    case ExecutionStatus.ERROR:
      return 'bg-red-500/20 border-red-500';
    case ExecutionStatus.WARNING:
      return 'bg-yellow-500/20 border-yellow-500';
    default:
      return 'bg-gray-500/10 border-gray-300';
  }
};

const WorkflowNodeComponent = memo(({ data, selected }: WorkflowNodeComponentProps) => {
  const nodeDefinition = NODE_DEFINITIONS[data.type];
  const IconComponent = (Icons as any)[nodeDefinition.icon] || Icons.Box;
  
  return (
    <Card 
      className={`
        min-w-[200px] p-4 border-2 transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${getStatusColor(data.status)}
        hover:shadow-lg cursor-pointer
      `}
    >
      {/* Input Handles */}
      {nodeDefinition.inputs.map((input, index) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{ 
            top: `${20 + index * 20}px`,
            background: '#6366f1',
            width: '12px',
            height: '12px',
            border: '2px solid white'
          }}
          className="!border-2 !border-white"
        />
      ))}

      {/* Node Content */}
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${nodeDefinition.color}20` }}
        >
          <IconComponent 
            className="h-5 w-5" 
            style={{ color: nodeDefinition.color }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm truncate">
              {nodeDefinition.name}
            </h3>
            {data.status !== ExecutionStatus.IDLE && (
              <Badge 
                variant="outline" 
                className="text-xs ml-2"
                style={{ 
                  borderColor: nodeDefinition.color,
                  color: nodeDefinition.color 
                }}
              >
                {data.status}
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed">
            {nodeDefinition.description}
          </p>
          
          {/* Execution time */}
          {data.executionTime && (
            <div className="text-xs text-muted-foreground mt-2">
              {data.executionTime}ms
            </div>
          )}
          
          {/* Error message */}
          {data.error && (
            <div className="text-xs text-red-500 mt-1 truncate">
              {data.error}
            </div>
          )}
        </div>
      </div>

      {/* Output Handles */}
      {nodeDefinition.outputs.map((output, index) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{ 
            top: `${20 + index * 20}px`,
            background: '#6366f1',
            width: '12px',
            height: '12px',
            border: '2px solid white'
          }}
          className="!border-2 !border-white"
        />
      ))}
    </Card>
  );
});

WorkflowNodeComponent.displayName = 'WorkflowNodeComponent';

export default WorkflowNodeComponent;
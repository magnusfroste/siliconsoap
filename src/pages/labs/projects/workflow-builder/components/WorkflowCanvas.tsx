import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ChatNode from './ChatNode';
import AINode from './AINode';
import RunNode from './RunNode';
import CodeNode from './CodeNode';

const nodeTypes = {
  chat: ChatNode,
  ai: AINode,
  run: RunNode,
  code: CodeNode,
  manualTrigger: ChatNode,
};

interface WorkflowCanvasProps {
  hasCredentials: boolean;
  workflowData?: any;
  onExecuteWorkflow?: () => void;
}

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'manualTrigger',
    position: { x: 100, y: 100 },
    data: { 
      label: "When clicking 'Execute workflow'",
    },
  },
  {
    id: 'code-1',
    type: 'code',
    position: { x: 400, y: 100 },
    data: { 
      label: 'Code',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'trigger-1',
    target: 'code-1',
    type: 'smoothstep',
  },
];

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ hasCredentials, workflowData, onExecuteWorkflow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflowData?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflowData?.edges || initialEdges);
  const [isExecuting, setIsExecuting] = useState(false);

  // Update workflow from imported data
  React.useEffect(() => {
    if (workflowData) {
      const convertedNodes = workflowData.nodes.map((n8nNode: any) => ({
        id: n8nNode.id,
        type: n8nNode.type.includes('manualTrigger') ? 'manualTrigger' : 
              n8nNode.type.includes('code') ? 'code' : 'chat',
        position: { x: n8nNode.position[0], y: n8nNode.position[1] },
        data: {
          label: n8nNode.name,
          code: n8nNode.parameters?.jsCode,
        },
      }));

      const convertedEdges = Object.entries(workflowData.connections || {}).flatMap(([sourceNode, connections]: any) => 
        connections.main?.[0]?.map((connection: any, index: number) => ({
          id: `${sourceNode}-${connection.node}-${index}`,
          source: workflowData.nodes.find((n: any) => n.name === sourceNode)?.id,
          target: workflowData.nodes.find((n: any) => n.name === connection.node)?.id,
          type: 'smoothstep',
        })) || []
      );

      setNodes(convertedNodes);
      setEdges(convertedEdges);
    }
  }, [workflowData, setNodes, setEdges]);

  // Update AI node credentials status
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'ai') {
          return {
            ...node,
            data: {
              ...node.data,
              hasCredentials,
            },
          };
        }
        return node;
      })
    );
  }, [hasCredentials, setNodes]);

  const executeWorkflow = useCallback(() => {
    setIsExecuting(true);
    
    // Update nodes to show execution state
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isExecuting: true,
        },
      }))
    );

    // Update edges to show execution state
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        style: { stroke: '#10b981', strokeWidth: 2 },
        animated: true,
      }))
    );

    // Simulate execution completion
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isExecuting: false,
            isExecuted: true,
          },
        }))
      );

      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          style: { stroke: '#10b981', strokeWidth: 2 },
          animated: false,
        }))
      );

      setIsExecuting(false);
      onExecuteWorkflow?.();
    }, 2000);
  }, [setNodes, setEdges, onExecuteWorkflow]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={executeWorkflow}
          disabled={isExecuting}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg transition-colors disabled:opacity-50"
        >
          🧪 {isExecuting ? 'Executing...' : 'Execute workflow'}
        </button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data?.isExecuted) return '#10b981';
            if (node.data?.isExecuting) return '#f59e0b';
            return '#6b7280';
          }}
          className="!bg-background border border-border"
        />
        <Background gap={20} className="bg-gray-100" />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
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

const nodeTypes = {
  chat: ChatNode,
  ai: AINode,
};

interface WorkflowCanvasProps {
  hasCredentials: boolean;
}

const initialNodes: Node[] = [
  {
    id: 'chat-1',
    type: 'chat',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Chat Input',
      message: 'Hello, how can you help me today?'
    },
  },
  {
    id: 'ai-1',
    type: 'ai',
    position: { x: 400, y: 100 },
    data: { 
      label: 'OpenAI GPT-4',
      model: 'gpt-4',
      hasCredentials: false
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'chat-1',
    target: 'ai-1',
    type: 'smoothstep',
    animated: true,
  },
];

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ hasCredentials }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'chat': return 'hsl(var(--primary))';
              case 'ai': return 'hsl(var(--secondary))';
              default: return 'hsl(var(--muted))';
            }
          }}
          className="!bg-background border border-border"
        />
        <Background gap={20} className="bg-muted/20" />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
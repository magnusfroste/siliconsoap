import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import BasicNode from './BasicNode';

// Simple node types mapping - starting with just one
const nodeTypes = {
  basic: BasicNode,
};

// Initial sample data for testing
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'basic',
    position: { x: 100, y: 100 },
    data: { label: 'Start Node' },
  },
  {
    id: '2',
    type: 'basic',
    position: { x: 400, y: 100 },
    data: { label: 'Process Node' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
  },
];

interface WorkflowCanvasProps {
  hasCredentials?: boolean;
  workflowData?: any;
  onWorkflowDataUpdate?: (data: any) => void;
  onExecuteWorkflow?: () => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ 
  hasCredentials, 
  workflowData,
  onWorkflowDataUpdate,
  onExecuteWorkflow 
}) => {
  console.log('WorkflowCanvas rendering');
  console.log('workflowData:', workflowData);
  
  // Use sample data if no workflow data provided, otherwise use provided data
  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflowData?.nodes?.length ? workflowData.nodes : initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflowData?.edges?.length ? workflowData.edges : initialEdges
  );

  console.log('Current nodes in state:', nodes);
  console.log('Current edges in state:', edges);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connecting nodes:', params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `basic-${Date.now()}`,
      type: 'basic',
      position: { x: 200 + nodes.length * 100, y: 200 },
      data: { label: `New Node ${nodes.length + 1}` },
    };
    console.log('Adding new node:', newNode);
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, nodes.length]);

  return (
    <div className="w-full h-full bg-background">
      {/* Debug Info */}
      <div className="absolute top-4 left-4 z-10 bg-card border rounded p-3 text-sm space-y-1">
        <div className="font-medium">Debug Info:</div>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        <div>Has Credentials: {String(hasCredentials)}</div>
        <Button 
          onClick={handleAddNode}
          size="sm"
          className="mt-2"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Node
        </Button>
      </div>

      {/* ReactFlow Canvas with explicit styling */}
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '600px',
          background: 'hsl(var(--muted))'
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Controls position="top-right" />
          <MiniMap 
            position="bottom-right"
            className="!bg-background border border-border"
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1}
            color="hsl(var(--border))"
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
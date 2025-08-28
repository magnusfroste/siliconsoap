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
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeType, WorkflowNode, ExecutionStatus, NodeCategory } from '../../types';
import { NODE_DEFINITIONS } from '../../constants/nodeDefinitions';
import WorkflowNodeComponent from '../nodes/WorkflowNodeComponent';

// Node types mapping
const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

// Initial sample nodes för demonstration
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflowNode',
    position: { x: 250, y: 100 },
    data: {
      id: '1',
      type: NodeType.MANUAL_TRIGGER,
      category: NodeCategory.TRIGGERS,
      position: { x: 250, y: 100 },
      data: {},
      inputs: [],
      outputs: NODE_DEFINITIONS[NodeType.MANUAL_TRIGGER].outputs,
      status: ExecutionStatus.IDLE,
    },
  },
  {
    id: '2',
    type: 'workflowNode',
    position: { x: 500, y: 100 },
    data: {
      id: '2',
      type: NodeType.HTTP_REQUEST,
      category: NodeCategory.ACTIONS,
      position: { x: 500, y: 100 },
      data: { url: 'https://api.example.com' },
      inputs: NODE_DEFINITIONS[NodeType.HTTP_REQUEST].inputs,
      outputs: NODE_DEFINITIONS[NodeType.HTTP_REQUEST].outputs,
      status: ExecutionStatus.SUCCESS,
      executionTime: 234,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: 'output',
    targetHandle: 'input',
    type: 'smoothstep',
    style: { stroke: '#6366f1', strokeWidth: 2 },
  },
];

interface WorkflowCanvasProps {
  onNodeAdd?: (nodeType: NodeType, position: { x: number; y: number }) => void;
  onNodeSelect?: (node: WorkflowNode | null) => void;
  className?: string;
}

export interface WorkflowCanvasHandle {
  addNode: (nodeType: NodeType, position?: { x: number; y: number }) => void;
}

const WorkflowCanvas = React.forwardRef<WorkflowCanvasHandle, WorkflowCanvasProps>((props, ref) => {
  const { onNodeAdd, onNodeSelect, className = '' } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        style: { stroke: '#6366f1', strokeWidth: 2 },
      }, eds));
    },
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    setSelectedNode(node.id);
    onNodeSelect?.(node.data as unknown as WorkflowNode);
  }, [onNodeSelect]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Function för att lägga till ny node
  const addNode = useCallback((nodeType: NodeType, position?: { x: number; y: number }) => {
    const nodeDefinition = NODE_DEFINITIONS[nodeType];
    const newId = `node_${Date.now()}`;
    const nodePosition = position || { 
      x: Math.random() * 400 + 100, 
      y: Math.random() * 300 + 100 
    };

    const newWorkflowNode: WorkflowNode = {
      id: newId,
      type: nodeType,
      category: nodeDefinition.category,
      position: nodePosition,
      data: {},
      inputs: nodeDefinition.inputs,
      outputs: nodeDefinition.outputs,
      status: ExecutionStatus.IDLE,
    };

    const newNode: Node = {
      id: newId,
      type: 'workflowNode',
      position: nodePosition,
      data: newWorkflowNode as any,
    };

    setNodes((nds) => [...nds, newNode]);
    onNodeAdd?.(nodeType, nodePosition);
  }, [setNodes, onNodeAdd]);

  // Expose addNode function för external use
  React.useImperativeHandle(ref, () => ({
    addNode,
  }));

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          selected: node.id === selectedNode
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="workflow-canvas"
        style={{ background: '#fafafa' }}
        nodesDraggable
        nodesConnectable
        elementsSelectable
      >
        <Controls 
          position="top-right"
          className="!bg-white !border !border-gray-200 !shadow-lg"
        />
        <MiniMap 
          position="bottom-right"
          className="!bg-white !border !border-gray-200 !shadow-lg"
          nodeColor={(node) => {
            const workflowNode = node.data as unknown as WorkflowNode;
            const nodeDefinition = NODE_DEFINITIONS[workflowNode.type];
            return nodeDefinition.color;
          }}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#e5e7eb"
        />
      </ReactFlow>
    </div>
  );
});

export default WorkflowCanvas;
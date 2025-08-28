import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Play, Square, Trash2, Plus } from 'lucide-react';

// Import node components
import ChatNode from './ChatNode';
import HttpRequestNode from './HttpRequestNode';
import CodeNode from './CodeNode';
import FilterNode from './FilterNode';
import IfNode from './IfNode';
import SetNode from './SetNode';
import RunNode from './RunNode';
import AINode from './AINode';

// Import other components
import NodeSelector from './NodeSelector';
import ExecutionBottomPanel from './ExecutionBottomPanel';
import DeletableEdge from './DeletableEdge';

// Define node types
const nodeTypes = {
  chat: ChatNode,
  ai: AINode,
  http: HttpRequestNode,
  code: CodeNode,
  filter: FilterNode,
  if: IfNode,
  set: SetNode,
  run: RunNode,
  manualTrigger: RunNode,
};

const edgeTypes = {
  default: DeletableEdge,
  smoothstep: DeletableEdge,
};

interface ExecutionStep {
  nodeId: string;
  nodeLabel: string;
  status: 'success' | 'error' | 'running';
  duration?: number;
  timestamp: Date;
  error?: string;
}

interface WorkflowCanvasProps {
  hasCredentials: boolean;
  workflowData?: any;
  onWorkflowDataUpdate?: (data: any) => void;
  onExecuteWorkflow?: () => void;
}

// Sample workflow nodes for demo
const sampleNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'manualTrigger',
    position: { x: 50, y: 100 },
    data: { 
      label: "When clicking 'Execute workflow'",
    },
  },
  {
    id: 'http-1',
    type: 'http',
    position: { x: 350, y: 100 },
    data: { 
      label: 'Fetch Users',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: {},
      timeout: 30000,
    },
  },
  {
    id: 'filter-1',
    type: 'filter',
    position: { x: 650, y: 100 },
    data: { 
      label: 'Filter Active Users',
      conditions: [
        {
          field: 'data.website',
          operator: 'is_not_empty',
          value: '',
          dataType: 'string'
        }
      ],
      combineConditions: 'AND',
    },
  },
  {
    id: 'set-1',
    type: 'set',
    position: { x: 950, y: 100 },
    data: { 
      label: 'Transform Data',
      operation: 'add_fields',
      fieldMappings: [
        {
          outputField: 'full_name',
          inputValue: 'data.name',
          type: 'expression'
        },
        {
          outputField: 'contact_email',
          inputValue: 'data.email',
          type: 'expression'
        }
      ],
      keepOnlySet: false,
    },
  },
];

const sampleEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'trigger-1',
    target: 'http-1',
    type: 'smoothstep',
  },
  {
    id: 'e2-3',
    source: 'http-1',
    target: 'filter-1',
    type: 'smoothstep',
  },
  {
    id: 'e3-4',
    source: 'filter-1',
    target: 'set-1',
    type: 'smoothstep',
  },
];

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ 
  hasCredentials, 
  workflowData,
  onWorkflowDataUpdate,
  onExecuteWorkflow 
}) => {
  // Determine initial nodes and edges
  const getInitialData = () => {
    if (workflowData && workflowData.nodes && workflowData.edges) {
      return {
        nodes: workflowData.nodes,
        edges: workflowData.edges
      };
    }
    // If no workflow data, check if it's meant to be empty (new workflow) or sample
    if (workflowData === null || (workflowData && workflowData.nodes && workflowData.nodes.length === 0)) {
      return { nodes: [], edges: [] }; // New workflow
    }
    return { nodes: sampleNodes, edges: sampleEdges }; // Sample workflow
  };

  const initialData = getInitialData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [nodeExecutionData, setNodeExecutionData] = useState<{[nodeId: string]: {inputData?: any[], outputData?: any[]}}>({});
  
  // UI state
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>();

  // Update parent when nodes or edges change
  useEffect(() => {
    if (onWorkflowDataUpdate) {
      onWorkflowDataUpdate({ nodes, edges });
    }
  }, [nodes, edges]); // Removed onWorkflowDataUpdate from deps to prevent loops

  // Update AI node credentials
  useEffect(() => {
    setNodes(prevNodes => 
      prevNodes.map(node => {
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

  const handleAddNode = useCallback((nodeType: string, title: string) => {
    const newId = `${nodeType}-${Date.now()}`;
    
    // Position new node to the right of existing nodes
    const rightmostNode = nodes.reduce((rightmost, node) => 
      node.position.x > rightmost.position.x ? node : rightmost, 
      { position: { x: 0, y: 100 } }
    );
    
    const newPosition = {
      x: (rightmostNode?.position?.x || 0) + 300,
      y: rightmostNode?.position?.y || 100,
    };

    const newNode: Node = {
      id: newId,
      type: nodeType === 'action' || nodeType === 'transform' || nodeType === 'flow' || nodeType === 'human' ? 'chat' : nodeType,
      position: newPosition,
      data: {
        label: title,
        ...(nodeType === 'ai' && { hasCredentials })
      },
    };

    setNodes((currentNodes) => [...currentNodes, newNode]);
    setIsNodeSelectorOpen(false);
  }, [nodes, setNodes, hasCredentials]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    if (!isBottomPanelOpen) {
      setIsBottomPanelOpen(true);
    }
  }, [isBottomPanelOpen]);

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true);
    setExecutionSteps([]);
    setNodeExecutionData({});
    
    // Simple execution simulation
    const nodeIds = nodes.map(n => n.id);
    
    for (const nodeId of nodeIds) {
      const node = nodes.find(n => n.id === nodeId);
      setExecutionSteps(prev => [...prev, {
        nodeId,
        nodeLabel: (node?.data?.label as string) || 'Unknown Node',
        status: 'running' as const,
        timestamp: new Date()
      }]);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExecutionSteps(prev => 
        prev.map(step => 
          step.nodeId === nodeId 
            ? { ...step, status: 'success' as const, duration: 1000 }
            : step
        )
      );
    }
    
    setIsExecuting(false);
    onExecuteWorkflow?.();
  }, [nodes, onExecuteWorkflow]);

  const handleClearExecution = () => {
    setExecutionSteps([]);
    setNodeExecutionData({});
    setSelectedNodeId(undefined);
  };

  const hasAINodes = nodes.some(node => node.type === 'ai');

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-background">
        <h2 className="text-xl font-semibold">Canvas</h2>
        <div className="flex items-center gap-2">
          {/* Execute Button */}
          <Button
            onClick={executeWorkflow}
            disabled={(!hasCredentials && hasAINodes) || isExecuting}
            className="bg-red-600 hover:bg-red-700 text-white px-6"
            size="lg"
          >
            {isExecuting ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute workflow
              </>
            )}
          </Button>
          
          {/* Clear Button */}
          {executionSteps.length > 0 && (
            <Button
              onClick={handleClearExecution}
              variant="outline"
              size="lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
          
          {/* Add Node Button */}
          <Button
            onClick={() => setIsNodeSelectorOpen(true)}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Node
          </Button>
        </div>
      </div>
      
      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-50"
          style={{ width: '100%', height: '100%' }}
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
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>

        {/* API Key Warning - only for AI workflows */}
        {!hasCredentials && hasAINodes && (
          <div className="absolute top-4 left-4 z-10 text-sm text-muted-foreground bg-background border rounded-md px-3 py-2 max-w-xs shadow-lg">
            Please add your OpenRouter API key to execute AI workflows
          </div>
        )}
        
        {/* Node Selector */}
        <NodeSelector 
          isOpen={isNodeSelectorOpen}
          onClose={() => setIsNodeSelectorOpen(false)}
          onAddNode={handleAddNode}
        />

        {/* Execution Panel */}
        {isBottomPanelOpen && (
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <ExecutionBottomPanel
              isOpen={isBottomPanelOpen}
              onToggle={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
              executionSteps={executionSteps}
              selectedNodeId={selectedNodeId}
              nodeData={nodeExecutionData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowCanvas;
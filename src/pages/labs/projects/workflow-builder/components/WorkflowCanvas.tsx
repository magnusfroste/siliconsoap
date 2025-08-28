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
  EdgeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ChatNode from './ChatNode';
import AINode from './AINode';
import RunNode from './RunNode';
import CodeNode from './CodeNode';
import DeletableEdge from './DeletableEdge';
import NodeSelector from './NodeSelector';
import ExecutionBottomPanel from './ExecutionBottomPanel';
import { Button } from '@/components/ui/button';
import { Play, Square, Trash2 } from 'lucide-react';
import { Plus } from 'lucide-react';
import { executeJavaScript, getNodeInputData } from '../utils/codeExecution';
import {
  executeHttpRequest,
  executeIfNode,
  executeFilterNode,
  executeSetNode,
  getNodeInputData as getNodeInput,
} from '../utils/nodeExecution';

import HttpRequestNode from './HttpRequestNode';
import IfNode from './IfNode';
import SetNode from './SetNode';
import FilterNode from './FilterNode';

const nodeTypes = {
  chat: ChatNode,
  ai: AINode,
  run: RunNode,
  code: CodeNode,
  manualTrigger: ChatNode,
  http: HttpRequestNode,
  if: IfNode,
  set: SetNode,
  filter: FilterNode,
};

const edgeTypes: EdgeTypes = {
  default: DeletableEdge,
  smoothstep: DeletableEdge,
};

interface WorkflowCanvasProps {
  hasCredentials: boolean;
  workflowData?: any;
  onWorkflowDataUpdate?: (data: any) => void;
  onExecuteWorkflow?: () => void;
}

interface ExecutionStep {
  nodeId: string;
  nodeLabel: string;
  status: 'success' | 'error' | 'running';
  duration?: number;
  timestamp: Date;
  error?: string;
}

const initialNodes: Node[] = [
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

const initialEdges: Edge[] = [
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
  const [nodes, setNodes, onNodesChange] = useNodesState(workflowData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflowData?.edges || []);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [nodeExecutionData, setNodeExecutionData] = useState<{[nodeId: string]: {inputData?: any[], outputData?: any[]}}>({});

  // Sync nodes and edges changes back to parent
  React.useEffect(() => {
    if (onWorkflowDataUpdate) {
      onWorkflowDataUpdate({ nodes, edges });
    }
  }, [nodes, edges, onWorkflowDataUpdate]);

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

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true);
    
    // First, reset all nodes
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isExecuting: false,
          isExecuted: false,
          inputData: [],
          outputData: [],
          executionError: undefined,
        },
      }))
    );

    // Start execution animation
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isExecuting: true,
          },
        }))
      );

      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          style: { stroke: '#10b981', strokeWidth: 2 },
          animated: true,
        }))
      );
    }, 100);

    // Execute nodes in topological order
    setTimeout(async () => {
      try {
        const currentNodes = nodes;
        const currentEdges = edges;
        
        // Get execution order
        const getExecutionOrder = (nodes: Node[], edges: Edge[]) => {
          const visited = new Set<string>();
          const order: Node[] = [];
          
          const visit = (nodeId: string) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            
            const incomingEdges = edges.filter(edge => edge.target === nodeId);
            for (const edge of incomingEdges) {
              visit(edge.source);
            }
            
            const node = nodes.find(n => n.id === nodeId);
            if (node) order.push(node);
          };
          
          const startNodes = nodes.filter(node => 
            !edges.some(edge => edge.target === node.id)
          );
          
          for (const node of startNodes) {
            visit(node.id);
          }
          
          return order;
        };
        
        const executionOrder = getExecutionOrder(currentNodes, currentEdges);
        const executionResults = new Map();
        
        // Execute nodes sequentially
        for (const node of executionOrder) {
          const startTime = Date.now();
          
          // Add execution step
          setExecutionSteps(prev => [...prev, {
            nodeId: node.id,
            nodeLabel: String(node.data?.label || node.type),
            status: 'running',
            timestamp: new Date(),
          }]);
          
          const inputData = getNodeInput(node.id, currentNodes, currentEdges, executionResults);
          let outputData = inputData;
          let executionError: string | undefined;
          
          try {
            switch (node.type) {
              case 'manualTrigger':
                outputData = inputData; // Already handled in getNodeInput
                break;
                
              case 'http':
                const httpConfig = {
                  method: String(node.data.method || 'GET'),
                  url: String(node.data.url || ''),
                  headers: (node.data.headers as Record<string, string>) || {},
                  body: String(node.data.body || ''),
                  timeout: Number(node.data.timeout || 30000),
                };
                
                const httpResult = await executeHttpRequest(httpConfig, inputData);
                outputData = httpResult.data;
                if (!httpResult.success) {
                  executionError = httpResult.error;
                }
                break;
                
              case 'if':
                const ifConfig = {
                  conditions: (node.data.conditions as any[]) || [],
                  combineConditions: (node.data.combineConditions as 'AND' | 'OR') || 'AND',
                };
                
                const ifResult = executeIfNode(ifConfig, inputData);
                outputData = ifResult.trueItems; // Main output goes to true path
                
                // Store both results for the node
                executionResults.set(node.id, {
                  trueItems: ifResult.trueItems,
                  falseItems: ifResult.falseItems,
                });
                break;
                
              case 'filter':
                const filterConfig = {
                  conditions: (node.data.conditions as any[]) || [],
                  combineConditions: (node.data.combineConditions as 'AND' | 'OR') || 'AND',
                };
                
                const filterResult = executeFilterNode(filterConfig, inputData);
                outputData = filterResult.data;
                if (!filterResult.success) {
                  executionError = filterResult.error;
                }
                break;
                
              case 'set':
                const setConfig = {
                  operation: String(node.data.operation || 'add_fields'),
                  fieldMappings: (node.data.fieldMappings as any[]) || [],
                  keepOnlySet: Boolean(node.data.keepOnlySet || false),
                };
                
                const setResult = executeSetNode(setConfig, inputData);
                outputData = setResult.data;
                if (!setResult.success) {
                  executionError = setResult.error;
                }
                break;
                
              case 'code':
                const code = (node.data.code as string) || `// Default code
for (const item of $input.all()) {
  item.myNewField = 1;
}
return $input.all();`;
                
                const codeResult = executeJavaScript(code, inputData);
                outputData = codeResult.output;
                executionError = codeResult.error;
                break;
                
              default:
                // Pass through for unknown node types
                outputData = inputData.map((item, index) => ({
                  ...item,
                  processedBy: node.type,
                  processedAt: new Date().toISOString(),
                  nodeId: node.id
                }));
            }
            
            const duration = Date.now() - startTime;
            
            // Store execution result for data flow
            executionResults.set(node.id, outputData);
            
            // Update execution data for bottom panel
            setNodeExecutionData(prev => ({
              ...prev,
              [node.id]: { inputData, outputData }
            }));
            
            // Update execution step with success
            setExecutionSteps(prev => 
              prev.map(step => 
                step.nodeId === node.id 
                  ? { ...step, status: 'success' as const, duration }
                  : step
              )
            );
            
            // Update the current nodes with execution results
            const nodeIndex = currentNodes.findIndex(n => n.id === node.id);
            if (nodeIndex !== -1) {
              currentNodes[nodeIndex] = {
                ...currentNodes[nodeIndex],
                data: {
                  ...currentNodes[nodeIndex].data,
                  inputData,
                  outputData,
                  executionError,
                  isExecuted: true,
                  isExecuting: false,
                },
              };
            }
            
            // Update nodes in real-time for visual feedback
            setNodes(prevNodes => 
              prevNodes.map(n => 
                n.id === node.id 
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        inputData,
                        outputData,
                        executionError,
                        isExecuted: true,
                        isExecuting: false,
                      },
                    }
                  : n
              )
            );
            
          } catch (error: any) {
            executionError = error.message;
            console.error(`Error executing node ${node.id}:`, error);
            
            // Update execution data for bottom panel
            setNodeExecutionData(prev => ({
              ...prev,
              [node.id]: { inputData, outputData: [] }
            }));
            
            // Update execution step with error
            setExecutionSteps(prev => 
              prev.map(step => 
                step.nodeId === node.id 
                  ? { ...step, status: 'error' as const, error: executionError }
                  : step
              )
            );
            
            const nodeIndex = currentNodes.findIndex(n => n.id === node.id);
            if (nodeIndex !== -1) {
              currentNodes[nodeIndex] = {
                ...currentNodes[nodeIndex],
                data: {
                  ...currentNodes[nodeIndex].data,
                  inputData,
                  outputData: [],
                  executionError,
                  isExecuted: true,
                  isExecuting: false,
                },
              };
            }
            
            // Update nodes with error state
            setNodes(prevNodes => 
              prevNodes.map(n => 
                n.id === node.id 
                  ? {
                      ...n,
                      data: {
                        ...n.data,
                        inputData,
                        outputData: [],
                        executionError,
                        isExecuted: true,
                        isExecuting: false,
                      },
                    }
                  : n
              )
            );
          }
        }
        
      } catch (error: any) {
        console.error('Workflow execution failed:', error);
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: {
              ...node.data,
              isExecuting: false,
              executionError: 'Workflow execution failed',
            },
          }))
        );
      }
      
      // Update edges
      setEdges((currentEdges) => 
        currentEdges.map((edge) => ({
          ...edge,
          style: { stroke: '#10b981', strokeWidth: 2 },
          animated: false,
        }))
      );

      setIsExecuting(false);
      onExecuteWorkflow?.();
    }, 1000);
  }, [nodes, edges, setNodes, setEdges, onExecuteWorkflow]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleAddNode = useCallback((nodeType: string, title: string) => {
    const newId = `${nodeType}-${Date.now()}`;
    
    // Position new node to the right of existing nodes
    const rightmostNode = nodes.reduce((rightmost, node) => 
      node.position.x > rightmost.position.x ? node : rightmost, 
      nodes[0] || { position: { x: 0, y: 100 } }
    );
    
    const newPosition = {
      x: rightmostNode.position.x + 250,
      y: rightmostNode.position.y || 100,
    };

    const newNode = {
      id: newId,
      type: nodeType === 'action' || nodeType === 'transform' || nodeType === 'flow' || nodeType === 'human' ? 'chat' : nodeType,
      position: newPosition,
      data: {
        label: title,
      },
    };

    setNodes((currentNodes) => [...currentNodes, newNode]);
  }, [nodes, setNodes]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    if (!isBottomPanelOpen) {
      setIsBottomPanelOpen(true);
    }
  }, [isBottomPanelOpen]);

  const handleClearExecution = () => {
    setExecutionSteps([]);
    setNodeExecutionData({});
    setSelectedNodeId(undefined);
    setNodes(prevNodes => 
      prevNodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          isExecuted: false,
          isExecuting: false,
          executionError: undefined,
          inputData: undefined,
          outputData: undefined,
        },
      }))
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Canvas</h2>
        <div className="flex items-center gap-2">
          {/* Execute Controls */}
          <Button
            onClick={executeWorkflow}
            disabled={!hasCredentials || isExecuting}
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
          <button 
            onClick={() => setIsNodeSelectorOpen(true)}
            className="w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center shadow-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative" style={{ marginBottom: isBottomPanelOpen ? '320px' : '0px' }}>
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

        {/* API Key Warning */}
        {!hasCredentials && (
          <div className="absolute top-4 left-4 z-10 text-sm text-muted-foreground bg-background border rounded-md px-3 py-2 max-w-xs">
            Please add your OpenRouter API key to execute workflows
          </div>
        )}
        
        <NodeSelector 
          isOpen={isNodeSelectorOpen}
          onClose={() => setIsNodeSelectorOpen(false)}
          onAddNode={handleAddNode}
        />
      </div>

      <ExecutionBottomPanel
        isOpen={isBottomPanelOpen}
        onToggle={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
        executionSteps={executionSteps}
        selectedNodeId={selectedNodeId}
        nodeData={nodeExecutionData}
      />
    </div>
  );
};

export default WorkflowCanvas;
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ChatNode from './ChatNode';
import AINode from './AINode';
import RunNode from './RunNode';
import CodeNode from './CodeNode';
import DeletableEdge from './DeletableEdge';
import NodeSelector from './NodeSelector';
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
  onExecuteWorkflow?: () => void;
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

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ hasCredentials, workflowData, onExecuteWorkflow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflowData?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflowData?.edges || initialEdges);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);

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
            
            // Store execution result for data flow
            executionResults.set(node.id, outputData);
            
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

      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => setIsNodeSelectorOpen(true)}
          className="w-10 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center shadow-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
        <Background gap={20} className="bg-gray-100" />
      </ReactFlow>

      <NodeSelector 
        isOpen={isNodeSelectorOpen}
        onClose={() => setIsNodeSelectorOpen(false)}
        onAddNode={handleAddNode}
      />
    </div>
  );
};

export default WorkflowCanvas;
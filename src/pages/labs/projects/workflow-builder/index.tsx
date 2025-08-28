import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WorkflowCanvas, { WorkflowCanvasHandle } from './components/canvas/WorkflowCanvas';
import NodePalette from './components/panels/NodePalette';
import NodeDataViewer from './components/NodeDataViewer';
import ExecutionBottomPanel from './components/ExecutionBottomPanel';
import WorkflowToolbar from './components/WorkflowToolbar';
import { NodeType, WorkflowNode, ExecutionStatus } from './types';
import { executeHttpRequest, executeIfNode, executeFilterNode, executeSetNode, getNodeInputData } from './utils/nodeExecution';
import { executeJavaScript } from './utils/codeExecution';

interface ExecutionStep {
  nodeId: string;
  nodeLabel: string;
  status: 'success' | 'error' | 'running';
  duration?: number;
  timestamp: Date;
  error?: string;
}

const WorkflowBuilder: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [clickedNode, setClickedNode] = useState<WorkflowNode | null>(null);
  const [isDataViewerOpen, setIsDataViewerOpen] = useState(false);
  const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [nodeData, setNodeData] = useState<Record<string, { inputData?: any[]; outputData?: any[] }>>({});
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const canvasRef = useRef<WorkflowCanvasHandle>(null);

  const handleNodeSelect = (nodeType: NodeType) => {
    if (canvasRef.current?.addNode) {
      canvasRef.current.addNode(nodeType);
    }
  };

  const handleNodeSelection = (node: WorkflowNode | null) => {
    setSelectedNode(node);
  };

  const handleNodeClick = (node: WorkflowNode) => {
    setClickedNode(node);
    setIsDataViewerOpen(true);
  };

  const handleCanvasDataUpdate = (updatedNodes: WorkflowNode[], updatedEdges: any[]) => {
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  const executeWorkflow = async () => {
    if (!nodes.length) return;
    
    setIsExecuting(true);
    setExecutionSteps([]);
    setIsExecutionPanelOpen(true);
    
    const executionResults = new Map<string, any>();
    const processedNodes = new Set<string>();
    
    // Find trigger nodes to start execution
    const triggerNodes = nodes.filter(node => node.type === NodeType.MANUAL_TRIGGER);
    
    for (const triggerNode of triggerNodes) {
      await executeNodeRecursively(triggerNode.id, executionResults, processedNodes);
    }
    
    setIsExecuting(false);
  };

  const executeNodeRecursively = async (nodeId: string, executionResults: Map<string, any>, processedNodes: Set<string>) => {
    if (processedNodes.has(nodeId)) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const startTime = Date.now();
    const step: ExecutionStep = {
      nodeId,
      nodeLabel: node.data.label || node.type,
      status: 'running',
      timestamp: new Date(),
    };
    
    setExecutionSteps(prev => [...prev, step]);
    
    try {
      const inputData = getNodeInputData(nodeId, nodes, edges, executionResults);
      let outputData: any[] = [];
      
      // Execute based on node type
      switch (node.type) {
        case NodeType.MANUAL_TRIGGER:
          outputData = inputData.length > 0 ? inputData : [
            { id: 1, name: 'Sample Item 1', value: 100, category: 'A', timestamp: new Date().toISOString() },
            { id: 2, name: 'Sample Item 2', value: 200, category: 'B', timestamp: new Date().toISOString() },
          ];
          break;
          
        case NodeType.HTTP_REQUEST:
          const httpResult = await executeHttpRequest(node.data.config || {
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            headers: {},
            timeout: 10000
          }, inputData);
          outputData = httpResult.data;
          if (!httpResult.success) throw new Error(httpResult.error);
          break;
          
        case NodeType.CODE:
          const codeResult = executeJavaScript(node.data.code || 'return $input.all();', inputData);
          outputData = codeResult.output;
          if (codeResult.error) throw new Error(codeResult.error);
          
          // Store console output in node data
          if (codeResult.consoleOutput && codeResult.consoleOutput.length > 0) {
            setNodes(prev => prev.map(n => 
              n.id === nodeId 
                ? { ...n, data: { ...n.data, consoleOutput: codeResult.consoleOutput } }
                : n
            ));
          }
          break;
          
        case NodeType.IF:
          const ifResult = executeIfNode(node.data.config || {
            conditions: [{ field: 'value', operator: 'greater_than', value: '150', dataType: 'number' }],
            combineConditions: 'AND'
          }, inputData);
          outputData = ifResult.trueItems;
          break;
          
        case NodeType.FILTER:
          const filterResult = executeFilterNode(node.data.config || {
            conditions: [{ field: 'category', operator: 'equals', value: 'A', dataType: 'string' }],
            combineConditions: 'AND'
          }, inputData);
          outputData = filterResult.data;
          if (!filterResult.success) throw new Error(filterResult.error);
          break;
          
        case NodeType.SET:
          const setResult = executeSetNode(node.data.config || {
            operation: 'add_fields',
            fieldMappings: [{ outputField: 'processed', inputValue: 'true', type: 'value' }],
            keepOnlySet: false
          }, inputData);
          outputData = setResult.data;
          if (!setResult.success) throw new Error(setResult.error);
          break;
          
        default:
          outputData = inputData;
      }
      
      const duration = Date.now() - startTime;
      executionResults.set(nodeId, outputData);
      
      // Update node data for display
      setNodeData(prev => ({
        ...prev,
        [nodeId]: { inputData, outputData }
      }));
      
      // Update execution step
      setExecutionSteps(prev => prev.map(s => 
        s.nodeId === nodeId ? { ...s, status: 'success', duration } : s
      ));
      
      processedNodes.add(nodeId);
      
      // Execute connected nodes
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        await executeNodeRecursively(edge.target, executionResults, processedNodes);
      }
      
    } catch (error: any) {
      setExecutionSteps(prev => prev.map(s => 
        s.nodeId === nodeId ? { ...s, status: 'error', error: error.message } : s
      ));
    }
  };

  const handleSaveCode = (code: string) => {
    if (clickedNode) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === clickedNode.id
            ? { ...node, data: { ...node.data, code } }
            : node
        )
      );
      // Update clickedNode state
      setClickedNode(prev => prev ? { ...prev, code } : null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="border-b border-border p-4 bg-card">
          <h1 className="text-2xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground">Build and execute automated workflows with n8n-style nodes</p>
        </div>
        
        {/* Main workspace */}
        <div className="flex-1 flex">
          {/* Node Palette */}
          <div className="w-80 border-r border-border bg-card/50">
            <NodePalette onNodeSelect={handleNodeSelect} />
          </div>
          
          {/* Canvas */}
          <div className="flex-1" style={{ marginBottom: isExecutionPanelOpen ? '320px' : '80px' }}>
            <WorkflowCanvas 
              ref={canvasRef}
              onNodeSelect={handleNodeSelection}
              onNodeClick={handleNodeClick}
              onDataUpdate={handleCanvasDataUpdate}
            />
          </div>
        </div>
      </main>
      
      {/* Node Data Viewer Modal */}
      <NodeDataViewer
        isOpen={isDataViewerOpen}
        onClose={() => setIsDataViewerOpen(false)}
        nodeData={clickedNode ? {
          id: clickedNode.id,
          type: clickedNode.type,
          label: clickedNode.data.label || clickedNode.type,
          code: clickedNode.data.code,
          inputData: nodeData[clickedNode.id]?.inputData,
          outputData: nodeData[clickedNode.id]?.outputData,
          consoleOutput: clickedNode.data.consoleOutput,
          isExecuted: nodeData[clickedNode.id]?.outputData?.length > 0,
        } : {
          id: '',
          type: '',
          label: '',
        }}
        onSaveCode={handleSaveCode}
      />
      
      {/* Execution Results Panel */}
      <ExecutionBottomPanel
        isOpen={isExecutionPanelOpen}
        onToggle={() => setIsExecutionPanelOpen(!isExecutionPanelOpen)}
        executionSteps={executionSteps}
        selectedNodeId={selectedNode?.id}
        nodeData={nodeData}
      />
      
      {/* Workflow Toolbar */}
      <WorkflowToolbar
        hasCredentials={true} // For now, assume we have credentials
        isExecuting={isExecuting}
        onExecute={executeWorkflow}
        onClear={() => {
          setExecutionSteps([]);
          setNodeData({});
          setIsExecutionPanelOpen(false);
        }}
      />
      
      <Footer />
    </div>
  );
};

export default WorkflowBuilder;
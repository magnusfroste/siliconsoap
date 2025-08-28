import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WorkflowCanvas, { WorkflowCanvasHandle } from './components/canvas/WorkflowCanvas';
import NodePalette from './components/panels/NodePalette';
import { NodeType, WorkflowNode } from './types';

const WorkflowBuilder: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const canvasRef = useRef<WorkflowCanvasHandle>(null);

  const handleNodeSelect = (nodeType: NodeType) => {
    // För nu, lägg till node på random position
    if (canvasRef.current?.addNode) {
      canvasRef.current.addNode(nodeType);
    }
  };

  const handleNodeSelection = (node: WorkflowNode | null) => {
    setSelectedNode(node);
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
          <div className="flex-1">
            <WorkflowCanvas 
              ref={canvasRef}
              onNodeSelect={handleNodeSelection}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WorkflowBuilder;
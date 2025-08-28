import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WorkflowCanvas from './components/WorkflowCanvas';

const WorkflowBuilder: React.FC = () => {
  console.log('WorkflowBuilder rendering');
  
  const [workflowData, setWorkflowData] = useState(null);

  const handleWorkflowDataUpdate = (data: any) => {
    console.log('Workflow data updated:', data);
    setWorkflowData(data);
  };

  const handleExecuteWorkflow = () => {
    console.log('Execute workflow requested');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="border-b border-border p-4 bg-card">
          <h1 className="text-2xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground">Build and execute automated workflows</p>
        </div>
        
        {/* Full height container for ReactFlow */}
        <div className="flex-1" style={{ height: 'calc(100vh - 200px)' }}>
          <WorkflowCanvas
            hasCredentials={true}
            workflowData={workflowData}
            onWorkflowDataUpdate={handleWorkflowDataUpdate}
            onExecuteWorkflow={handleExecuteWorkflow}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WorkflowBuilder;
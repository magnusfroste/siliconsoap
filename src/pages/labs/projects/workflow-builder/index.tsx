import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WorkflowTabs, { Workflow } from './components/WorkflowTabs';
import WorkflowCanvas from './components/WorkflowCanvas';
import CredentialsManager from './components/CredentialsManager';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const WorkflowBuilder: React.FC = () => {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'workflow-1',
      name: 'Sample Workflow',
      data: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);
  const [activeView, setActiveView] = useState<'workflows' | 'credentials' | 'executions'>('workflows');
  const [activeWorkflowId, setActiveWorkflowId] = useState('workflow-1');

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId);

  const handleWorkflowSelect = (workflowId: string) => {
    setActiveWorkflowId(workflowId);
  };

  const handleWorkflowCreate = (name: string) => {
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name,
      data: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    setActiveWorkflowId(newWorkflow.id);
  };

  const handleWorkflowDelete = (workflowId: string) => {
    if (workflows.length <= 1) return;
    
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    
    if (activeWorkflowId === workflowId) {
      const remainingWorkflows = workflows.filter(w => w.id !== workflowId);
      setActiveWorkflowId(remainingWorkflows[0]?.id || '');
    }
  };

  const handleWorkflowRename = (workflowId: string, newName: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, name: newName, updatedAt: new Date() }
        : w
    ));
  };

  const handleWorkflowDuplicate = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const duplicatedWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      data: workflow.data ? JSON.parse(JSON.stringify(workflow.data)) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setWorkflows(prev => [...prev, duplicatedWorkflow]);
    setActiveWorkflowId(duplicatedWorkflow.id);
  };

  const handleWorkflowImport = (data: any) => {
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: data.name || 'Imported Workflow',
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    setActiveWorkflowId(newWorkflow.id);
  };

  const handleWorkflowExport = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const dataToExport = workflow.data || { name: workflow.name, nodes: [], edges: [] };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWorkflowDataUpdate = (data: any) => {
    setWorkflows(prev => prev.map(w => 
      w.id === activeWorkflowId 
        ? { ...w, data, updatedAt: new Date() }
        : w
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Navigation Tabs */}
        <WorkflowTabs
          workflows={workflows}
          activeWorkflowId={activeWorkflowId}
          activeView={activeView}
          onViewChange={setActiveView}
          onWorkflowSelect={handleWorkflowSelect}
          onWorkflowCreate={handleWorkflowCreate}
          onWorkflowDelete={handleWorkflowDelete}
          onWorkflowRename={handleWorkflowRename}
          onWorkflowDuplicate={handleWorkflowDuplicate}
          onWorkflowImport={handleWorkflowImport}
          onWorkflowExport={handleWorkflowExport}
        />

        {/* Content Area */}
        {activeView === 'workflows' && (
          <div className="flex flex-1">
            {/* Sidebar */}
            <div className="w-80 bg-muted/20 p-4 border-r border-border">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Workflow Builder</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Create AI workflows by connecting nodes
                </p>
                
                <div className="text-sm text-muted-foreground">
                  Active: <span className="font-medium">{activeWorkflow?.name}</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-4">
                Use the workflow tabs above to manage multiple workflows.
              </div>
            </div>
            
            {/* Canvas */}
            <div className="flex-1">
              <WorkflowCanvas 
                hasCredentials={hasCredentials} 
                workflowData={activeWorkflow?.data}
                onWorkflowDataUpdate={handleWorkflowDataUpdate}
                onExecuteWorkflow={() => console.log('Workflow executed!')}
              />
            </div>
          </div>
        )}

        {activeView === 'credentials' && (
          <CredentialsManager onCredentialsChange={setHasCredentials} />
        )}

        {activeView === 'executions' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Executions</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WorkflowBuilder;
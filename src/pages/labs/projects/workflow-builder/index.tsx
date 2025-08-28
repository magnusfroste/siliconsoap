import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WorkflowTabs, { Workflow } from './components/WorkflowTabs';
import WorkflowCanvas from './components/WorkflowCanvas';
import CredentialsManager from './components/CredentialsManager';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

// Default workflow data with sample nodes and edges
const defaultWorkflowData = {
  nodes: [
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
  ],
  edges: [
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
  ],
};

const WorkflowBuilder: React.FC = () => {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'workflow-1',
      name: 'Sample Workflow',
      data: defaultWorkflowData,
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
      data: { nodes: [], edges: [] },
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
          <div className="flex-1 h-full">
            <WorkflowCanvas 
              hasCredentials={hasCredentials} 
              workflowData={activeWorkflow?.data}
              onWorkflowDataUpdate={handleWorkflowDataUpdate}
              onExecuteWorkflow={() => console.log('Workflow executed!')}
            />
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
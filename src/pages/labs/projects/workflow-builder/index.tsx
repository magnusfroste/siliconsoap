import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CredentialsPanel from './components/CredentialsPanel';
import WorkflowCanvas from './components/WorkflowCanvas';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const WorkflowBuilder: React.FC = () => {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [workflowData, setWorkflowData] = useState(null);

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            setWorkflowData(jsonData);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex">
        {/* Sidebar */}
        <div className="w-80 bg-muted/20 p-4 border-r border-border">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Workflow Builder</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Create AI workflows by connecting nodes
            </p>
            
            <Button 
              onClick={handleImportJSON}
              className="w-full mb-4"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import n8n JSON
            </Button>
          </div>
          
          <CredentialsPanel onCredentialsChange={setHasCredentials} />
          
          <div className="text-xs text-muted-foreground mt-4">
            Import n8n workflow JSON files to visualize and execute them.
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas 
            hasCredentials={hasCredentials} 
            workflowData={workflowData}
            onExecuteWorkflow={() => console.log('Workflow executed!')}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkflowBuilder;
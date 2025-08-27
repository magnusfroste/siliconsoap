import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CredentialsPanel from './components/CredentialsPanel';
import WorkflowCanvas from './components/WorkflowCanvas';

const WorkflowBuilder: React.FC = () => {
  const [hasCredentials, setHasCredentials] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex">
        {/* Sidebar */}
        <div className="w-80 bg-muted/20 p-4 border-r border-border">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Workflow Builder</h2>
            <p className="text-sm text-muted-foreground">
              Create AI workflows by connecting nodes
            </p>
          </div>
          
          <CredentialsPanel onCredentialsChange={setHasCredentials} />
          
          <div className="text-xs text-muted-foreground">
            Connect chat input to AI models to create conversational workflows.
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas hasCredentials={hasCredentials} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkflowBuilder;
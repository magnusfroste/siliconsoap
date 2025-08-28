import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const WorkflowBuilder: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="border-b border-border p-4 bg-card">
          <h1 className="text-2xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground">Build and execute automated workflows</p>
        </div>
        
        {/* Placeholder för workflow builder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              Vi bygger en kraftfull workflow builder inspirerad av n8n.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WorkflowBuilder;
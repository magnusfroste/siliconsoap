import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const WorkflowBuilder: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="h-[calc(100vh-120px)]">
          <iframe
            src="https://lovable.dev/projects/ca2c8cb7-488c-4548-be13-782d945ee184"
            className="w-full h-full border-0"
            title="AI Workflow Builder"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkflowBuilder;
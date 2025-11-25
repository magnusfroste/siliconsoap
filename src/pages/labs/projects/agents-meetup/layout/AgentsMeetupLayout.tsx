import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { SettingsDrawer } from '@/components/labs/SettingsDrawer';
import { useLabsState } from '../hooks/useLabsState';
import { profiles, responseLengthOptions } from '../constants';

export const AgentsMeetupLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [state, actions] = useLabsState();

  // Group models by provider for the drawer
  const modelsByProvider = state.availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:block border-r transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <ChatSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background z-50 md:hidden animate-slide-in-right">
            <ChatSidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader 
          onMenuClick={() => setSidebarOpen(true)}
          onSettingsClick={() => actions.setSettingsOpen(true)}
        />
        
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        open={state.settingsOpen}
        onOpenChange={actions.setSettingsOpen}
        numberOfAgents={state.numberOfAgents}
        setNumberOfAgents={actions.setNumberOfAgents}
        rounds={state.rounds}
        setRounds={actions.setRounds}
        responseLength={state.responseLength}
        setResponseLength={actions.setResponseLength}
        responseLengthOptions={responseLengthOptions}
        agentAModel={state.agentAModel}
        setAgentAModel={actions.setAgentAModel}
        agentBModel={state.agentBModel}
        setAgentBModel={actions.setAgentBModel}
        agentCModel={state.agentCModel}
        setAgentCModel={actions.setAgentCModel}
        agentAPersona={state.agentAPersona}
        agentBPersona={state.agentBPersona}
        agentCPersona={state.agentCPersona}
        handleAgentAPersonaChange={(value: string) => actions.setAgentAPersona(value)}
        handleAgentBPersonaChange={(value: string) => actions.setAgentBPersona(value)}
        handleAgentCPersonaChange={(value: string) => actions.setAgentCPersona(value)}
        profiles={profiles}
        formA={state.formA}
        formB={state.formB}
        formC={state.formC}
        modelsByProvider={modelsByProvider}
        loadingModels={state.loadingModels}
        isUsingSharedKey={state.isUsingSharedKey}
        promptForBYOK={actions.promptForBYOK}
      />
    </div>
  );
};

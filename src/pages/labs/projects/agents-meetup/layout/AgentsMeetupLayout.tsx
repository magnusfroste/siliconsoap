import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { SettingsDrawer } from '@/components/labs/SettingsDrawer';
import { useLabsState } from '../hooks/useLabsState';
import { useAuth } from '../hooks/useAuth';
import { profiles, responseLengthOptions } from '../constants';
import { Loader2 } from 'lucide-react';

export const AgentsMeetupLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [state, actions] = useLabsState();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle authentication at layout level
  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;
    
    // Only redirect to auth if we're not already on a public route
    // and the user is not authenticated
    if (!user && !location.pathname.includes('/auth')) {
      navigate('/auth', { state: { from: location } });
    }
  }, [user, loading, navigate, location]);

  // Group models by provider for the drawer
  const modelsByProvider = state.availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, any[]>);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          user={user}
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
            <ChatSidebar onClose={() => setSidebarOpen(false)} user={user} />
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

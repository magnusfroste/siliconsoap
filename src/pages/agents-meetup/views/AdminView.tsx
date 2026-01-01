import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Bot, MessageSquare, Settings2, Sparkles, PanelLeft, BarChart3, Zap, Users } from 'lucide-react';
import { 
  AdminHeader, 
  useAdminFlags, 
  ModelsTab, 
  AgentsTab, 
  ConversationTab, 
  FeaturesTab,
  SettingsTab,
  AnalyticsTab,
  SeedingTab,
  UsersTab
} from './admin';

export const AdminView = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const {
    loading: flagsLoading,
    agentDefaultFlags,
    conversationSettingsFlags,
    expertSettingsFlags,
    featureToggleFlags,
    handleToggle,
    handleNumericChange,
    handleTextChange
  } = useAdminFlags();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('Access denied');
      navigate('/new');
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading || flagsLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <AdminHeader />

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-8 h-12">
          <TabsTrigger value="users" className="gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2 text-sm">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Models</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2 text-sm">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="conversation" className="gap-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Conversation</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2 text-sm">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="seeding" className="gap-2 text-sm">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Seeding</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 text-sm">
            <PanelLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Sidebar</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="users" className="m-0">
            <UsersTab />
          </TabsContent>

          <TabsContent value="models" className="m-0">
            <ModelsTab />
          </TabsContent>

          <TabsContent value="agents" className="m-0">
            <AgentsTab
              agentFlags={agentDefaultFlags}
              onToggle={handleToggle}
              onNumericChange={handleNumericChange}
              onTextChange={handleTextChange}
            />
          </TabsContent>

          <TabsContent value="conversation" className="m-0">
            <ConversationTab
              conversationFlags={conversationSettingsFlags}
              expertFlags={expertSettingsFlags}
              onToggle={handleToggle}
              onNumericChange={handleNumericChange}
              onTextChange={handleTextChange}
            />
          </TabsContent>

          <TabsContent value="features" className="m-0">
            <FeaturesTab
              featureFlags={featureToggleFlags}
              onToggle={handleToggle}
              onNumericChange={handleNumericChange}
              onTextChange={handleTextChange}
            />
          </TabsContent>

          <TabsContent value="analytics" className="m-0">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="seeding" className="m-0">
            <SeedingTab />
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <SettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

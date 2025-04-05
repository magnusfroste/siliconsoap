import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Loader2, Settings, Zap, User, UserRound, ExternalLink, BarChart2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type ConversationEntry = {
  agent: string;
  message: string;
  model: string;
  persona: string;
};

type Profile = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
};

interface ConversationCardProps {
  conversation: ConversationEntry[];
  isLoading: boolean;
  profiles: Profile[];
  getCurrentScenario: () => any;
  getCurrentPrompt: () => string;
  goToStep: (step: number) => void;
  availableModels: any[];
  formatMessage: (text: string) => string;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  isLoading,
  profiles,
  getCurrentScenario,
  getCurrentPrompt,
  goToStep,
  availableModels,
  formatMessage
}) => {
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);

  // Helper function to get profile avatar icon
  const getProfileIcon = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return <User className="h-4 w-4" />;
    return profile.icon;
  };

  // Helper function to get agent color classes
  const getAgentColorClasses = (agent: string) => {
    if (agent === 'Agent A') {
      return {
        bgColorClass: 'bg-purple-50 border-purple-200',
        avatarBgClass: 'bg-purple-100',
        avatarTextClass: 'text-purple-700',
      };
    } else if (agent === 'Agent B') {
      return {
        bgColorClass: 'bg-blue-50 border-blue-200',
        avatarBgClass: 'bg-blue-100',
        avatarTextClass: 'text-blue-700',
      };
    } else {
      return {
        bgColorClass: 'bg-green-50 border-green-200',
        avatarBgClass: 'bg-green-100',
        avatarTextClass: 'text-green-700',
      };
    }
  };

  const currentScenario = getCurrentScenario();
  const currentPrompt = getCurrentPrompt();

  return (
    <Card className="mb-12 overflow-hidden border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          Agent Conversation
        </CardTitle>
        <CardDescription>
          <span>{currentScenario.name}: </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="link" 
                  onClick={() => setPromptDialogOpen(true)}
                  className="p-0 h-auto font-normal text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  "{currentPrompt.length > 50 ? `${currentPrompt.substring(0, 50)}...` : currentPrompt}"
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Click to view full prompt</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardDescription>
      </CardHeader>
      <div className="px-6">
        <Separator />
      </div>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {conversation.map((entry, index) => {
            const currentProfile = profiles.find(p => p.id === entry.persona);
            const modelName = availableModels.find(m => m.id === entry.model)?.name || entry.model.split('/').pop() || entry.model;
            const colorClasses = getAgentColorClasses(entry.agent);
            
            return (
              <div key={index} className={`flex gap-4 ${
                entry.agent === 'Agent A' 
                  ? 'justify-start' 
                  : entry.agent === 'Agent C' 
                    ? 'justify-center' 
                    : 'justify-end'
              }`}>
                <div className={`rounded-lg p-4 max-w-[80%] ${colorClasses.bgColorClass} border`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className={`h-8 w-8 ${colorClasses.avatarBgClass} ${colorClasses.avatarTextClass}`}>
                      <AvatarFallback>
                        {getProfileIcon(entry.persona)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{entry.agent}</span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span>{modelName}</span>
                        <span>•</span>
                        <span>{currentProfile?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: formatMessage(entry.message) }}
                  />
                </div>
              </div>
            );
          })}
          {isLoading && conversation.length > 0 && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
              </div>
            </div>
          )}
          {conversation.length === 0 && !isLoading && (
            <div className="flex justify-center items-center p-6 text-gray-500">
              <p>No conversation started yet. The conversation will appear here.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button
          onClick={() => goToStep(2)}
          variant="outline"
          disabled={isLoading}
        >
          Back to Configuration
        </Button>
        
        {conversation.length > 0 && (
          <Button 
            onClick={() => goToStep(4)} 
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Analyze Conversation
          </Button>
        )}
      </CardFooter>

      {/* Prompt Dialog */}
      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{currentScenario.name} Prompt</DialogTitle>
            <DialogDescription>Full text of the prompt used for this conversation</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mt-4 whitespace-pre-wrap">
            {currentPrompt}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

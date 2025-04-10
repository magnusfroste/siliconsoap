
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Loader2, Check, Save, ArrowRight, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

interface APIKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  savedApiKey: string;
  isSaving: boolean;
  isSaved: boolean;
  isUsingEnvKey?: boolean;
  saveApiKey: () => void;
  deleteApiKey?: () => void;
  goToStep: (step: number) => void;
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({
  apiKey,
  setApiKey,
  savedApiKey,
  isSaving,
  isSaved,
  isUsingEnvKey,
  saveApiKey,
  deleteApiKey,
  goToStep
}) => {
  const hasEnvApiKey = import.meta.env.VITE_OPENROUTER_API_KEY && import.meta.env.VITE_OPENROUTER_API_KEY.length > 0;
  const hasUserKey = apiKey && apiKey !== import.meta.env.VITE_OPENROUTER_API_KEY;
  
  // Helper function to determine if the save button should be disabled
  const isSaveButtonDisabled = () => {
    // Only disable if:
    // 1. Currently saving
    // 2. API key is empty
    // 3. API key hasn't changed from saved key
    return isSaving || !apiKey.trim() || apiKey === savedApiKey;
  };
  
  // Helper function to stop any ongoing speech synthesis before navigation
  const stopSpeech = () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-4 w-4 text-purple-600" />
          OpenRouter API Key
        </CardTitle>
        <CardDescription>Required to enable real AI model interactions</CardDescription>
      </CardHeader>
      <CardContent>
        {hasEnvApiKey ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
            <p className="text-sm text-green-800 flex items-center">
              <Check className="h-4 w-4 mr-2" />
              A default API key is available for free models - usage is on the house but daily limits apply
            </p>
            <p className="text-xs text-green-700 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center">
                      <Info className="h-3 w-3 mr-1" /> 
                      Free models will use the default API key until rate limits are reached. For continued usage or paid models, your own key is required.
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">
                      The default API key works with models marked as "free" but has daily usage limits. 
                      If these limits are reached, you'll need to provide your own OpenRouter API key to continue 
                      or switch to using paid models with your own key.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
          </div>
        ) : null}
        
        {!hasUserKey && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-sm text-red-800 flex items-center font-medium">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Personal API Key Required for Paid Models
            </p>
            <p className="text-xs text-red-700 mt-1">
              You must enter your own OpenRouter API key to use paid models like Claude, GPT-4, etc.
              Free models will work with the default key.
            </p>
          </div>
        )}
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <p className="text-sm text-amber-800 flex items-center font-medium">
            <Info className="h-4 w-4 mr-2" />
            How API Keys Work
          </p>
          <p className="text-xs text-amber-700 mt-1">
            <strong>For free models:</strong> The app will use the default API key if available, but is subject to daily usage limits.<br />
            <strong>For paid models:</strong> Your personal API key will be used to access your OpenRouter credits.<br />
            <strong>Important:</strong> After entering your API key, make sure to click <strong>Save Key</strong> before proceeding.
          </p>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Input
            type="password"
            placeholder="sk-or-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono flex-1"
          />
          <Button 
            onClick={saveApiKey} 
            disabled={isSaveButtonDisabled()}
            className={isSaved ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSaved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">{isSaving ? "Saving..." : isSaved ? "Saved" : "Save Key"}</span>
          </Button>
          
          {deleteApiKey && hasUserKey && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Delete Key</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete API Key?</DialogTitle>
                  <DialogDescription>
                    This will remove your saved API key. You'll need to re-enter it to use paid models or if the platform rate limits are reached.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      deleteApiKey();
                    }}
                  >
                    Delete API Key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">openrouter.ai/keys</a>
          </p>
          
          {savedApiKey || hasEnvApiKey ? (
            <p className="text-xs text-green-600 mt-1">
              <Check className="h-3 w-3 inline mr-1" />
              {hasEnvApiKey && !hasUserKey ? 
                "Default API key is available for free models. Your own key is required for paid models." : 
                "API key is saved and active. You can now proceed to the next step."}
            </p>
          ) : (
            <p className="text-xs text-amber-600 mt-1">
              Please save your API key to continue to the next step.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          onClick={() => {
            stopSpeech();
            goToStep(2);
          }} 
          disabled={!savedApiKey && !hasEnvApiKey} 
          className="ml-auto"
        >
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, X, Clipboard, Eye, EyeOff, RefreshCw, Info } from 'lucide-react';
import { useApiKey } from '@/pages/agents-meetup/hooks/useApiKey';
import { toast } from '@/hooks/use-toast';
import { fetchOpenRouterModels } from '@/utils/openRouter';

interface APIKeyInputProps {
  goToStep: (step: number) => void;
  refreshModels?: () => void;
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({ goToStep, refreshModels }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { 
    saveApiKey, 
    deleteApiKey, 
    validateApiKey, 
    userApiKey,
    enableSharedKeyMode,
    isUsingSharedKey
  } = useApiKey();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user API key from localStorage on component mount
  useEffect(() => {
    if (userApiKey) {
      setApiKey(userApiKey);
    }
  }, [userApiKey]);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const isValid = await validateApiKey(apiKey);
    
    if (isValid) {
      saveApiKey(apiKey);
      toast({
        title: "API Key Saved",
        description: "Your OpenRouter API key has been saved successfully.",
      });
      
      // Refresh models before proceeding to the next step
      if (refreshModels) {
        console.log("Refreshing models after saving API key");
        refreshModels();
      }
      
      // Add a small delay before proceeding to the next step
      // This gives time for the models to load
      setTimeout(() => {
        goToStep(2);
      }, 1000);
    } else {
      toast({
        title: "Invalid API Key",
        description: "The API key you entered is invalid. Please check and try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleDeleteApiKey = () => {
    deleteApiKey();
    setApiKey('');
    toast({
      title: "API Key Deleted",
      description: "Your OpenRouter API key has been removed.",
    });
  };

  const handleContinue = () => {
    if (userApiKey || isUsingSharedKey) {
      // Refresh models before proceeding to the next step
      if (refreshModels) {
        refreshModels();
      }
      goToStep(2);
    }
  };

  const handleTryWithoutKey = () => {
    enableSharedKeyMode();
    toast({
      title: "Using Shared API Key",
      description: "You can test the feature with our shared API key. Add your own key for unlimited usage.",
    });
    goToStep(2);
  };

  const handleRefreshModels = async () => {
    if (!userApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenRouter API key to refresh models.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      // Manually refresh models
      if (refreshModels) {
        refreshModels();
        toast({
          title: "Models Refreshed",
          description: "Available models have been refreshed.",
        });
      }
    } catch (error) {
      console.error("Error refreshing models:", error);
      toast({
        title: "Error",
        description: "Failed to refresh models. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setApiKey(text.trim());
      toast({
        title: "Pasted from clipboard",
        description: "API key has been pasted from clipboard.",
      });
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      toast({
        title: "Clipboard Error",
        description: "Could not access clipboard. Please paste manually.",
        variant: "destructive",
      });
    }
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter key
    if (e.key === 'Enter' && !userApiKey && !isLoading) {
      handleSaveApiKey();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bring Your Own API Key</CardTitle>
        <CardDescription>
          This app uses a "Bring Your Own Key" approach for privacy and security. Your key stays in your browser and is never sent to our servers.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Quick Setup</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Get your free OpenRouter API key in just 30 seconds:
            </p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Visit <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline hover:text-blue-500 font-medium"
              >
                openrouter.ai/keys
              </a></li>
              <li>Sign in with Google, GitHub, or email</li>
              <li>Copy your API key and paste it below</li>
            </ol>
            <p className="text-xs mt-2 text-gray-600">
              OpenRouter provides access to the latest AI models with a generous free tier.
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="apiKey">Your OpenRouter API Key</Label>
            <div className="flex">
              <div className="relative flex-grow">
                <Input
                  id="apiKey"
                  ref={inputRef}
                  placeholder="Enter your OpenRouter API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                  type={showApiKey ? "text" : "password"}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={toggleShowApiKey}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="ml-2" 
                onClick={handlePaste}
                title="Paste from clipboard"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
              {userApiKey && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2" 
                  onClick={handleDeleteApiKey}
                  title="Delete API key"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {userApiKey && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="ml-2" 
                  onClick={handleRefreshModels}
                  title="Refresh models"
                  disabled={isRefreshing}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500 mt-1">
                API keys start with "sk-or-"
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Stored in your browser only
              </p>
            </div>
          </div>
        </div>
        
        {userApiKey && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              API Key saved successfully! You can now continue to agent configuration.
            </AlertDescription>
          </Alert>
        )}

        {isUsingSharedKey && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're using a shared API key for testing. For unlimited usage, add your own OpenRouter API key above.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4">
        <div className="text-xs text-gray-500 text-center w-full">
          Your key is stored locally and never leaves your device
        </div>
        <div className="flex flex-col gap-2 w-full">
          {!userApiKey && !isUsingSharedKey ? (
            <>
              <Button onClick={handleSaveApiKey} disabled={isLoading} className="w-full">
                {isLoading ? "Validating..." : "Save API Key"}
              </Button>
              <Button onClick={handleTryWithoutKey} variant="outline" className="w-full">
                Try Without API Key
              </Button>
            </>
          ) : (
            <Button onClick={handleContinue} className="w-full">
              Continue
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

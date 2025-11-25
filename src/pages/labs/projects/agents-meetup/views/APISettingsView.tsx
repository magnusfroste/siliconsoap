import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Key, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLabsState } from '../hooks/useLabsState';
import { toast } from 'sonner';

export const APISettingsView = () => {
  const [state, actions] = useLabsState();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsSaving(true);
    try {
      await actions.saveApiKey(apiKeyInput);
      toast.success('API key saved successfully');
      setApiKeyInput('');
    } catch (error) {
      toast.error('Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    try {
      await actions.deleteApiKey();
      toast.success('API key deleted');
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Settings</h1>
        <p className="text-muted-foreground">Manage your OpenRouter API key for unlimited usage</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Access Status
              </CardTitle>
              <CardDescription>Your current API configuration</CardDescription>
            </div>
            {state.isUsingSharedKey ? (
              <Badge variant="secondary">Using Shared API</Badge>
            ) : (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Personal API
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {state.isUsingSharedKey ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're using our shared API key. If you encounter rate limits, add your own OpenRouter API key below for unlimited usage.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                You're using your personal OpenRouter API key. You have unlimited access to all models.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add/Update API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Your OpenRouter API Key</CardTitle>
          <CardDescription>
            Get your API key from{' '}
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              openrouter.ai/keys
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-or-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSaveApiKey} 
              disabled={isSaving || !apiKeyInput.trim()}
            >
              {state.isUsingSharedKey ? 'Add API Key' : 'Update API Key'}
            </Button>

            {!state.isUsingSharedKey && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteApiKey}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove Key
              </Button>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your API key is stored securely in your browser's local storage and is never sent to our servers.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of Using Your Own API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
              <span>No rate limits - generate unlimited conversations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
              <span>Access to all OpenRouter models</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
              <span>Direct billing control through OpenRouter</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
              <span>Better performance and priority access</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

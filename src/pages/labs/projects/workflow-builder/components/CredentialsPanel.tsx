import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Key, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CredentialsPanelProps {
  onCredentialsChange: (hasCredentials: boolean) => void;
}

const CredentialsPanel: React.FC<CredentialsPanelProps> = ({ onCredentialsChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    if (apiKey.trim()) {
      setIsConnected(true);
      onCredentialsChange(true);
    }
  };

  const handleDisconnect = () => {
    setApiKey('');
    setIsConnected(false);
    onCredentialsChange(false);
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Key className="h-4 w-4 text-primary" />
        <span className="font-medium">OpenAI Credentials</span>
        {isConnected && (
          <Badge variant="default" className="ml-auto">
            <Check className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="apiKey" className="text-sm">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isConnected}
            className="mt-1"
          />
        </div>
        
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={!apiKey.trim()}
              size="sm"
              className="flex-1"
            >
              Connect
            </Button>
          ) : (
            <Button 
              onClick={handleDisconnect} 
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Disconnect
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CredentialsPanel;
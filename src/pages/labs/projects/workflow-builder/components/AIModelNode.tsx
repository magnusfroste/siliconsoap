import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { X, Settings, Brain, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import CredentialsManager from './CredentialsManager';

interface AIModelConfig {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  credentialId: string;
}

const AIModelNode = memo<NodeProps>(({ id, data, selected }) => {
  const nodeData = data as any;
  const { setNodes } = useReactFlow();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const [tempConfig, setTempConfig] = useState<AIModelConfig>({
    provider: nodeData.provider || 'openrouter',
    model: nodeData.model || 'meta-llama/llama-3.3-70b-instruct:free',
    temperature: nodeData.temperature || 0.7,
    maxTokens: nodeData.maxTokens || 1000,
    credentialId: nodeData.credentialId || ''
  });

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const handleSaveConfig = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...tempConfig } }
          : node
      )
    );
    setIsConfigOpen(false);
  };

  const handleOpenConfig = () => {
    setTempConfig({
      provider: nodeData.provider || 'openrouter',
      model: nodeData.model || 'meta-llama/llama-3.3-70b-instruct:free',
      temperature: nodeData.temperature || 0.7,
      maxTokens: nodeData.maxTokens || 1000,
      credentialId: nodeData.credentialId || ''
    });
    setIsConfigOpen(true);
  };

  const getNodeStyle = () => {
    if (selected) return 'border-2 border-primary bg-card shadow-lg';
    if (nodeData.executionError) return 'bg-destructive/10 border-destructive';
    if (nodeData.isExecuted) return 'bg-green-500/10 border-green-500';
    return 'bg-card border-border hover:border-accent-foreground/50';
  };

  const isConfigured = nodeData.model && nodeData.credentialId;
  const modelName = nodeData.model?.split('/').pop()?.split(':')[0] || 'Not configured';
  const isFreeModel = nodeData.model?.includes(':free');
  const providerName = nodeData.provider || 'openrouter';

  const providerOptions = [
    { label: 'OpenRouter', value: 'openrouter' },
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' }
  ];

  const getModelOptions = (provider: string) => {
    switch (provider) {
      case 'openrouter':
        return [
          { label: 'Meta Llama 3.3 70B (Free)', value: 'meta-llama/llama-3.3-70b-instruct:free' },
          { label: 'DeepSeek V3 (Free)', value: 'deepseek/deepseek-chat-v3-0324:free' },
          { label: 'Google Gemma 3 27B (Free)', value: 'google/gemma-3-27b-it:free' },
          { label: 'GPT-4o Mini', value: 'openai/gpt-4o-mini' },
          { label: 'Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' }
        ];
      case 'openai':
        return [
          { label: 'GPT-4o', value: 'gpt-4o' },
          { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
          { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
        ];
      case 'anthropic':
        return [
          { label: 'Claude Opus 4', value: 'claude-opus-4-20250514' },
          { label: 'Claude Sonnet 4', value: 'claude-sonnet-4-20250514' },
          { label: 'Claude Haiku 3.5', value: 'claude-3-5-haiku-20241022' }
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <div
        className={`min-w-[200px] p-4 rounded-lg relative ${getNodeStyle()}`}
        style={{ borderWidth: '1px' }}
      >
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-500" />
          <span className="font-medium text-sm">AI Chat Model</span>
          {isFreeModel && <Badge variant="secondary" className="text-xs">Free</Badge>}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Provider:</span>
            <Badge variant="outline" className="text-xs capitalize">
              {providerName}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Model:</span>
            <span className="font-medium truncate max-w-[100px]" title={modelName}>
              {modelName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Temperature:</span>
            <span className="font-medium">{nodeData.temperature || 0.7}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Credential:</span>
            {nodeData.credentialId ? (
              <Badge variant="secondary" className="text-xs">
                <Key className="w-3 h-3 mr-1" />
                Set
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">Not Set</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenConfig}
            className="flex-1 text-xs"
          >
            <Settings className="w-3 h-3 mr-1" />
            Configure
          </Button>
        </div>

        {!isConfigured && (
          <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-xs text-orange-600">
            Model and credentials required
          </div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#8B5CF6' }}
        />
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure AI Chat Model</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="model" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
            </TabsList>

            <TabsContent value="model" className="space-y-4">
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Select 
                      value={tempConfig.provider} 
                      onValueChange={(value) => {
                        setTempConfig({
                          ...tempConfig, 
                          provider: value,
                          model: getModelOptions(value)[0]?.value || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providerOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose the AI model provider
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Select value={tempConfig.model} onValueChange={(value) => setTempConfig({...tempConfig, model: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {getModelOptions(tempConfig.provider).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Foundation model for AI processing
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <Card className="p-4">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="temperature">Temperature: {tempConfig.temperature}</Label>
                    <Slider
                      value={[tempConfig.temperature]}
                      onValueChange={(value) => setTempConfig({...tempConfig, temperature: value[0]})}
                      min={0}
                      max={2}
                      step={0.1}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls randomness (0.0 = deterministic, 2.0 = very creative)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={tempConfig.maxTokens}
                      onChange={(e) => setTempConfig({...tempConfig, maxTokens: parseInt(e.target.value) || 1000})}
                      min={1}
                      max={4000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum number of tokens to generate (1-4000)
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4">
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="credentialId">Credential ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="credentialId"
                        value={tempConfig.credentialId}
                        onChange={(e) => setTempConfig({...tempConfig, credentialId: e.target.value})}
                        placeholder="Select or create credential"
                        readOnly
                      />
                      <Button
                        variant="outline"
                        onClick={() => setShowCredentials(true)}
                        className="shrink-0"
                      >
                        <Key className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      API credentials for {tempConfig.provider} access
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig}>
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Credentials</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Configure API credentials for {tempConfig.provider} provider.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

AIModelNode.displayName = 'AIModelNode';

export default AIModelNode;
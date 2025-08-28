import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { X, Settings, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import NodeDataViewer from './NodeDataViewer';

interface AIAgentConfig {
  model: string;
  systemMessage: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
  responseFormat: string;
  apiKey?: string;
}

const AIAgentNode = memo<NodeProps>(({ id, data, selected }) => {
  const nodeData = data as any;
  const { setNodes } = useReactFlow();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDataViewerOpen, setIsDataViewerOpen] = useState(false);

  const [tempConfig, setTempConfig] = useState<AIAgentConfig>({
    model: nodeData.model || 'meta-llama/llama-3.3-70b-instruct:free',
    systemMessage: nodeData.systemMessage || 'You are a helpful AI assistant.',
    userPrompt: nodeData.userPrompt || '{{input}}',
    temperature: nodeData.temperature || 0.7,
    maxTokens: nodeData.maxTokens || 1000,
    responseFormat: nodeData.responseFormat || 'text',
    apiKey: nodeData.apiKey || ''
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
      model: nodeData.model || 'meta-llama/llama-3.3-70b-instruct:free',
      systemMessage: nodeData.systemMessage || 'You are a helpful AI assistant.',
      userPrompt: nodeData.userPrompt || '{{input}}',
      temperature: nodeData.temperature || 0.7,
      maxTokens: nodeData.maxTokens || 1000,
      responseFormat: nodeData.responseFormat || 'text',
      apiKey: nodeData.apiKey || ''
    });
    setIsConfigOpen(true);
  };

  const getNodeStyle = () => {
    if (selected) return 'border-2 border-primary bg-card shadow-lg';
    if (nodeData.executionError) return 'bg-destructive/10 border-destructive';
    if (nodeData.isExecuted) return 'bg-green-500/10 border-green-500';
    if (nodeData.isExecuting) return 'bg-blue-500/10 border-blue-500 animate-pulse';
    return 'bg-card border-border hover:border-accent-foreground/50';
  };

  const isConfigured = nodeData.model && nodeData.userPrompt;
  const modelName = nodeData.model?.split('/').pop()?.split(':')[0] || 'Not configured';
  const isFreeModel = nodeData.model?.includes(':free');

  const modelOptions = [
    { label: 'Meta Llama 3.3 70B (Free)', value: 'meta-llama/llama-3.3-70b-instruct:free' },
    { label: 'DeepSeek V3 (Free)', value: 'deepseek/deepseek-chat-v3-0324:free' },
    { label: 'Google Gemma 3 27B (Free)', value: 'google/gemma-3-27b-it:free' },
    { label: 'GPT-4o Mini', value: 'openai/gpt-4o-mini' },
    { label: 'Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' }
  ];

  const responseFormatOptions = [
    { label: 'Text', value: 'text' },
    { label: 'JSON', value: 'json' },
    { label: 'Auto', value: 'auto' }
  ];

  return (
    <>
      <div
        className={`min-w-[220px] p-4 rounded-lg relative ${getNodeStyle()}`}
        style={{ borderWidth: '1px' }}
      >
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555' }}
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-sm">AI Agent</span>
          {isFreeModel && <Badge variant="secondary" className="text-xs">Free</Badge>}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Model:</span>
            <span className="font-medium truncate max-w-[100px]" title={modelName}>
              {modelName}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Format:</span>
            <Badge variant="outline" className="text-xs">
              {nodeData.responseFormat || 'text'}
            </Badge>
          </div>

          {nodeData.temperature !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Temperature:</span>
              <span className="font-medium">{nodeData.temperature}</span>
            </div>
          )}

          {nodeData.isExecuted && nodeData.outputData && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Response:</span>
              <Badge variant="secondary" className="text-xs">
                {typeof nodeData.outputData === 'string' 
                  ? `${nodeData.outputData.length} chars`
                  : 'Generated'
                }
              </Badge>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenConfig();
            }}
            className="flex-1 text-xs"
          >
            <Settings className="w-3 h-3 mr-1" />
            Configure
          </Button>
          
          {nodeData.isExecuted && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsDataViewerOpen(true);
              }}
              className="flex-1 text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              View Data
            </Button>
          )}
        </div>

        {nodeData.executionError && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
            Error: {nodeData.executionError}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#555' }}
        />
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure AI Agent</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="system">System Message</TabsTrigger>
              <TabsTrigger value="prompt">User Prompt</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Select value={tempConfig.model} onValueChange={(value) => setTempConfig({...tempConfig, model: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {modelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose the AI model to process your requests
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="responseFormat">Response Format</Label>
                    <Select value={tempConfig.responseFormat} onValueChange={(value) => setTempConfig({...tempConfig, responseFormat: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        {responseFormatOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expected format of the AI response
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="apiKey">OpenRouter API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={tempConfig.apiKey}
                      onChange={(e) => setTempConfig({...tempConfig, apiKey: e.target.value})}
                      placeholder="sk-or-..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your OpenRouter API key for model access
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card className="p-4">
                <div>
                  <Label htmlFor="systemMessage">System Message</Label>
                  <Textarea
                    id="systemMessage"
                    value={tempConfig.systemMessage}
                    onChange={(e) => setTempConfig({...tempConfig, systemMessage: e.target.value})}
                    rows={8}
                    placeholder="You are a helpful AI assistant..."
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Instructions that define the AI's role and behavior. This message sets the context for how the AI should respond.
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="prompt" className="space-y-4">
              <Card className="p-4">
                <div>
                  <Label htmlFor="userPrompt">User Prompt Template</Label>
                  <Textarea
                    id="userPrompt"
                    value={tempConfig.userPrompt}
                    onChange={(e) => setTempConfig({...tempConfig, userPrompt: e.target.value})}
                    rows={6}
                    placeholder="{{input}}"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Template for the user message. Use {`{{input}}`} to include data from previous nodes.
                  </p>
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Template Variables:</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li><code>{`{{input}}`}</code> - Input data from previous node</li>
                      <li><code>{`{{input.field}}`}</code> - Specific field from input object</li>
                      <li><code>{`{{json input}}`}</code> - JSON-formatted input data</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
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

      <NodeDataViewer
        isOpen={isDataViewerOpen}
        onClose={() => setIsDataViewerOpen(false)}
        nodeData={{
          id,
          type: 'AI Agent',
          label: 'AI Agent',
          inputData: nodeData.inputData,
          outputData: nodeData.outputData,
          isExecuted: nodeData.isExecuted,
          executionError: nodeData.executionError
        }}
      />
    </>
  );
});

AIAgentNode.displayName = 'AIAgentNode';

export default AIAgentNode;
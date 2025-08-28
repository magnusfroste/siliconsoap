import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Globe, Settings, X, Save, MoreHorizontal, Shield, Key, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import NodeDataViewer from './NodeDataViewer';

type AuthType = 'none' | 'bearer' | 'apikey' | 'basic' | 'custom';

interface HttpRequestNodeData {
  id: string;
  label: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  timeout: number;
  authType: AuthType;
  authConfig: {
    token?: string;
    apiKey?: string;
    apiKeyLocation?: 'header' | 'query';
    apiKeyName?: string;
    username?: string;
    password?: string;
    customHeaderName?: string;
    customHeaderValue?: string;
  };
  queryParams: Record<string, string>;
  responseFormat: 'auto' | 'json' | 'text';
  failOnError: boolean;
  inputData?: any[];
  outputData?: any[];
  isExecuted: boolean;
  executionError?: string;
}

const HttpRequestNode = memo<NodeProps>(({ id, data, selected }) => {
  const nodeData = data as any;
  const { setNodes } = useReactFlow();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDataViewOpen, setIsDataViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    method: nodeData.method || 'GET',
    url: nodeData.url || '',
    headers: nodeData.headers || {},
    body: nodeData.body || '',
    timeout: nodeData.timeout || 30000,
    authType: nodeData.authType || 'none' as AuthType,
    authConfig: nodeData.authConfig || {},
    queryParams: nodeData.queryParams || {},
    responseFormat: nodeData.responseFormat || 'auto',
    failOnError: nodeData.failOnError ?? true,
  });

  const handleSaveConfig = () => {
    // Update node data with new configuration using setNodes
    setNodes(nodes => 
      nodes.map(node => 
        node.id === id 
          ? { ...node, data: { ...node.data, ...tempConfig } }
          : node
      )
    );
    setIsConfigOpen(false);
  };

  const handleCancel = () => {
    setTempConfig({
      method: nodeData.method || 'GET',
      url: nodeData.url || '',
      headers: nodeData.headers || {},
      body: nodeData.body || '',
      timeout: nodeData.timeout || 30000,
      authType: nodeData.authType || 'none' as AuthType,
      authConfig: nodeData.authConfig || {},
      queryParams: nodeData.queryParams || {},
      responseFormat: nodeData.responseFormat || 'auto',
      failOnError: nodeData.failOnError ?? true,
    });
    setIsConfigOpen(false);
  };

  const addHeader = () => {
    setTempConfig(prev => ({
      ...prev,
      headers: { ...prev.headers, '': '' }
    }));
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    setTempConfig(prev => {
      const newHeaders = { ...prev.headers };
      if (oldKey !== newKey) {
        delete newHeaders[oldKey];
      }
      newHeaders[newKey] = value;
      return { ...prev, headers: newHeaders };
    });
  };

  const removeHeader = (key: string) => {
    setTempConfig(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  const addQueryParam = () => {
    setTempConfig(prev => ({
      ...prev,
      queryParams: { ...prev.queryParams, '': '' }
    }));
  };

  const updateQueryParam = (oldKey: string, newKey: string, value: string) => {
    setTempConfig(prev => {
      const newParams = { ...prev.queryParams };
      if (oldKey !== newKey) {
        delete newParams[oldKey];
      }
      newParams[newKey] = value;
      return { ...prev, queryParams: newParams };
    });
  };

  const removeQueryParam = (key: string) => {
    setTempConfig(prev => {
      const newParams = { ...prev.queryParams };
      delete newParams[key];
      return { ...prev, queryParams: newParams };
    });
  };

  const getAuthIcon = () => {
    switch (tempConfig.authType) {
      case 'bearer': return <Shield className="w-3 h-3" />;
      case 'apikey': return <Key className="w-3 h-3" />;
      case 'basic': return <Lock className="w-3 h-3" />;
      case 'custom': return <Settings className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    if (nodeData.executionError) return 'bg-destructive';
    if (nodeData.isExecuted) return 'bg-green-500';
    return 'bg-muted';
  };

  return (
    <>
      <div 
        className={`relative bg-background border-2 rounded-lg shadow-sm transition-all ${
          selected ? 'border-primary' : 'border-border'
        } ${isHovered ? 'shadow-md' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Handle type="target" position={Position.Left} className="w-3 h-3" />
        
        <div className="p-4 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">HTTP Request</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfigOpen(true)}
              className="h-6 w-6 p-0"
            >
              <Settings className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {tempConfig.method}
              </Badge>
              {tempConfig.authType !== 'none' && (
                <div className="flex items-center gap-1">
                  {getAuthIcon()}
                  <span className="text-xs text-muted-foreground">Auth</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground truncate">
                {tempConfig.url || 'No URL configured'}
              </span>
            </div>
            
            {Object.keys(tempConfig.queryParams).length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {Object.keys(tempConfig.queryParams).length} params
                </Badge>
              </div>
            )}
            
            {nodeData.isExecuted && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                <span className="text-xs text-muted-foreground">
                  {nodeData.executionError ? 'Failed' : 'Success'}
                </span>
              </div>
            )}
          </div>
        </div>

        {isHovered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDataViewOpen(true)}
            className="absolute top-2 right-8 h-6 w-6 p-0 opacity-60 hover:opacity-100"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        )}
        
        <Handle type="source" position={Position.Right} className="w-3 h-3" />
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure HTTP Request</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="request" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="params">Parameters</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="request" className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <Label htmlFor="method" className="text-right">Method</Label>
                    <Select value={tempConfig.method} onValueChange={(value) => setTempConfig(prev => ({ ...prev, method: value }))}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="HEAD">HEAD</SelectItem>
                    <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <Label htmlFor="url" className="text-right">URL</Label>
                <Input
                  id="url"
                  className="col-span-3"
                  value={tempConfig.url}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.example.com/endpoint"
                />
              </div>
              
              {(tempConfig.method === 'POST' || tempConfig.method === 'PUT' || tempConfig.method === 'PATCH') && (
                <div className="grid grid-cols-4 gap-2">
                  <Label htmlFor="body" className="text-right">Body</Label>
                  <Textarea
                    id="body"
                    className="col-span-3"
                    value={tempConfig.body}
                    onChange={(e) => setTempConfig(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="JSON body content"
                    rows={6}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="auth" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  <Label htmlFor="authType" className="text-right">Type</Label>
                  <Select value={tempConfig.authType} onValueChange={(value: AuthType) => setTempConfig(prev => ({ ...prev, authType: value, authConfig: {} }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Authentication</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="apikey">API Key</SelectItem>
                      <SelectItem value="basic">Basic Authentication</SelectItem>
                      <SelectItem value="custom">Custom Header</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {tempConfig.authType === 'bearer' && (
                  <div className="grid grid-cols-4 gap-2">
                    <Label htmlFor="token" className="text-right">Token</Label>
                    <Input
                      id="token"
                      type="password"
                      className="col-span-3"
                      value={tempConfig.authConfig.token || ''}
                      onChange={(e) => setTempConfig(prev => ({ 
                        ...prev, 
                        authConfig: { ...prev.authConfig, token: e.target.value }
                      }))}
                      placeholder="Bearer token"
                    />
                  </div>
                )}
                
                {tempConfig.authType === 'apikey' && (
                  <>
                    <div className="grid grid-cols-4 gap-2">
                      <Label htmlFor="apiKeyLocation" className="text-right">Location</Label>
                      <Select value={tempConfig.authConfig.apiKeyLocation || 'header'} onValueChange={(value: 'header' | 'query') => setTempConfig(prev => ({ 
                        ...prev, 
                        authConfig: { ...prev.authConfig, apiKeyLocation: value }
                      }))}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="header">Header</SelectItem>
                          <SelectItem value="query">Query Parameter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Label htmlFor="apiKeyName" className="text-right">Name</Label>
                      <Input
                        id="apiKeyName"
                        className="col-span-3"
                        value={tempConfig.authConfig.apiKeyName || ''}
                        onChange={(e) => setTempConfig(prev => ({ 
                          ...prev, 
                          authConfig: { ...prev.authConfig, apiKeyName: e.target.value }
                        }))}
                        placeholder="X-API-Key"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Label htmlFor="apiKey" className="text-right">Value</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        className="col-span-3"
                        value={tempConfig.authConfig.apiKey || ''}
                        onChange={(e) => setTempConfig(prev => ({ 
                          ...prev, 
                          authConfig: { ...prev.authConfig, apiKey: e.target.value }
                        }))}
                        placeholder="API key value"
                      />
                    </div>
                  </>
                )}
                
                {tempConfig.authType === 'basic' && (
                  <>
                    <div className="grid grid-cols-4 gap-2">
                      <Label htmlFor="username" className="text-right">Username</Label>
                      <Input
                        id="username"
                        className="col-span-3"
                        value={tempConfig.authConfig.username || ''}
                        onChange={(e) => setTempConfig(prev => ({ 
                          ...prev, 
                          authConfig: { ...prev.authConfig, username: e.target.value }
                        }))}
                        placeholder="Username"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Label htmlFor="password" className="text-right">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        className="col-span-3"
                        value={tempConfig.authConfig.password || ''}
                        onChange={(e) => setTempConfig(prev => ({ 
                          ...prev, 
                          authConfig: { ...prev.authConfig, password: e.target.value }
                        }))}
                        placeholder="Password"
                      />
                    </div>
                  </>
                )}
                
                {tempConfig.authType === 'custom' && (
                  <>
                    <div className="grid grid-cols-4 gap-2">
                      <Label htmlFor="customHeaderName" className="text-right">Header Name</Label>
                      <Input
                        id="customHeaderName"
                        className="col-span-3"
                        value={tempConfig.authConfig.customHeaderName || ''}
                        onChange={(e) => setTempConfig(prev => ({ 
                          ...prev, 
                          authConfig: { ...prev.authConfig, customHeaderName: e.target.value }
                        }))}
                        placeholder="Custom-Auth-Header"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Label htmlFor="customHeaderValue" className="text-right">Header Value</Label>
                      <Input
                        id="customHeaderValue"
                        type="password"
                        className="col-span-3"
                        value={tempConfig.authConfig.customHeaderValue || ''}
                        onChange={(e) => setTempConfig(prev => ({ 
                          ...prev, 
                          authConfig: { ...prev.authConfig, customHeaderValue: e.target.value }
                        }))}
                        placeholder="Header value"
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="params" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Query Parameters</h3>
                <Button onClick={addQueryParam} size="sm" variant="outline">
                  Add Parameter
                </Button>
              </div>
              
              <div className="space-y-2">
                {Object.entries(tempConfig.queryParams).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={key}
                      onChange={(e) => updateQueryParam(key, e.target.value, String(value))}
                      placeholder="Parameter name"
                      className="flex-1"
                    />
                    <Input
                      value={String(value)}
                      onChange={(e) => updateQueryParam(key, key, e.target.value)}
                      placeholder="Parameter value"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => removeQueryParam(key)}
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="headers" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Headers</h3>
                <Button onClick={addHeader} size="sm" variant="outline">
                  Add Header
                </Button>
              </div>
              
                  <div className="space-y-2">
                {Object.entries(tempConfig.headers).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={key}
                      onChange={(e) => updateHeader(key, e.target.value, String(value))}
                      placeholder="Header name"
                      className="flex-1"
                    />
                    <Input
                      value={String(value)}
                      onChange={(e) => updateHeader(key, key, e.target.value)}
                      placeholder="Header value"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => removeHeader(key)}
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="options" className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <Label htmlFor="timeout" className="text-right">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  className="col-span-3"
                  value={tempConfig.timeout}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <Label htmlFor="responseFormat" className="text-right">Response Format</Label>
                <Select value={tempConfig.responseFormat} onValueChange={(value: 'auto' | 'json' | 'text') => setTempConfig(prev => ({ ...prev, responseFormat: value }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="failOnError"
                  checked={tempConfig.failOnError}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, failOnError: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="failOnError" className="text-sm">
                  Fail workflow on HTTP error status codes
                </Label>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={handleCancel} variant="outline">Cancel</Button>
            <Button onClick={handleSaveConfig}>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Viewer */}
      <NodeDataViewer
        isOpen={isDataViewOpen}
        onClose={() => setIsDataViewOpen(false)}
        nodeData={{
          id: nodeData.id,
          type: 'http',
          label: nodeData.label,
          inputData: nodeData.inputData,
          outputData: nodeData.outputData,
          isExecuted: nodeData.isExecuted,
          executionError: nodeData.executionError,
        }}
      />
    </>
  );
});

HttpRequestNode.displayName = 'HttpRequestNode';

export default HttpRequestNode;
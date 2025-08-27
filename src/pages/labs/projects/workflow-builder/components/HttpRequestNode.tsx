import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Globe, Settings, X, Save, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import NodeDataViewer from './NodeDataViewer';

interface HttpRequestNodeData {
  id: string;
  label: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  timeout: number;
  inputData?: any[];
  outputData?: any[];
  isExecuted: boolean;
  executionError?: string;
}

const HttpRequestNode = memo<NodeProps>(({ id, data, selected }) => {
  const nodeData = data as any;
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isDataViewOpen, setIsDataViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tempConfig, setTempConfig] = useState({
    method: nodeData.method || 'GET',
    url: nodeData.url || '',
    headers: nodeData.headers || {},
    body: nodeData.body || '',
    timeout: nodeData.timeout || 30000,
  });

  const handleSaveConfig = () => {
    // Update node data with new configuration
    Object.assign(nodeData, tempConfig);
    setIsConfigOpen(false);
  };

  const handleCancel = () => {
    setTempConfig({
      method: nodeData.method || 'GET',
      url: nodeData.url || '',
      headers: nodeData.headers || {},
      body: nodeData.body || '',
      timeout: nodeData.timeout || 30000,
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
              <span className="text-xs text-muted-foreground truncate">
                {tempConfig.url || 'No URL configured'}
              </span>
            </div>
            
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="request">Request</TabsTrigger>
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
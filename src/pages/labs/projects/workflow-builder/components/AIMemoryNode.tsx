import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { X, Settings, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AIMemoryConfig {
  memoryType: string;
  maxMessages: number;
}

const AIMemoryNode = memo<NodeProps>(({ id, data, selected }) => {
  const nodeData = data as any;
  const { setNodes } = useReactFlow();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const [tempConfig, setTempConfig] = useState<AIMemoryConfig>({
    memoryType: nodeData.memoryType || 'simple',
    maxMessages: nodeData.maxMessages || 10
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
      memoryType: nodeData.memoryType || 'simple',
      maxMessages: nodeData.maxMessages || 10
    });
    setIsConfigOpen(true);
  };

  const getNodeStyle = () => {
    if (selected) return 'border-2 border-primary bg-card shadow-lg';
    return 'bg-card border-border hover:border-accent-foreground/50';
  };

  const memoryTypeOptions = [
    { label: 'Simple Memory', value: 'simple' },
    { label: 'Buffer Memory', value: 'buffer' },
    { label: 'Summary Memory', value: 'summary' }
  ];

  return (
    <>
      <div
        className={`min-w-[180px] p-4 rounded-lg relative ${getNodeStyle()}`}
        style={{ borderWidth: '1px' }}
      >
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-purple-500" />
          <span className="font-medium text-sm">Simple Memory</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant="outline" className="text-xs capitalize">
              {nodeData.memoryType || 'simple'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Max Messages:</span>
            <span className="font-medium">{nodeData.maxMessages || 10}</span>
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

        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#8B5CF6' }}
        />
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Memory</DialogTitle>
          </DialogHeader>

          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="memoryType">Memory Type</Label>
                <Select value={tempConfig.memoryType} onValueChange={(value) => setTempConfig({...tempConfig, memoryType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select memory type" />
                  </SelectTrigger>
                  <SelectContent>
                    {memoryTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Type of memory to maintain conversation context
                </p>
              </div>

              <div>
                <Label htmlFor="maxMessages">Max Messages</Label>
                <Input
                  id="maxMessages"
                  type="number"
                  value={tempConfig.maxMessages}
                  onChange={(e) => setTempConfig({...tempConfig, maxMessages: parseInt(e.target.value) || 10})}
                  min={1}
                  max={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum number of messages to keep in memory
                </p>
              </div>
            </div>
          </Card>

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
    </>
  );
});

AIMemoryNode.displayName = 'AIMemoryNode';

export default AIMemoryNode;
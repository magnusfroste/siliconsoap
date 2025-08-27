import React, { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Code, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CodeNodeData {
  label?: string;
  code?: string;
  isExecuting?: boolean;
  isExecuted?: boolean;
}

const defaultCode = `// Loop over input items and add a new field called 'myNewField' to the JSON of each one
for (const item of $input.all()) {
  item.json.myNewField = 1;
}

return $input.all();`;

const CodeNode = memo(({ data, id }: { data: CodeNodeData; id: string }) => {
  const [code, setCode] = useState(data.code || defaultCode);
  const [isOpen, setIsOpen] = useState(false);
  const [tempCode, setTempCode] = useState(code);
  const [isHovered, setIsHovered] = useState(false);
  const { setNodes } = useReactFlow();

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const handleSave = () => {
    setCode(tempCode);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempCode(code);
    setIsOpen(false);
  };

  const getNodeStyle = () => {
    if (data.isExecuted) return "border-2 border-green-500 bg-background shadow-lg";
    if (data.isExecuting) return "border-2 border-yellow-500 bg-background shadow-lg animate-pulse";
    return "border-2 border-gray-300 bg-background hover:border-gray-400 transition-colors";
  };

  const getHandleStyle = () => {
    if (data.isExecuted) return "!bg-green-500";
    if (data.isExecuting) return "!bg-yellow-500";
    return "!bg-gray-400";
  };

  return (
    <div 
      className={`min-w-[180px] p-4 rounded-lg relative ${getNodeStyle()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <Handle type="target" position={Position.Left} className={getHandleStyle()} />
      
      <div className="flex items-center justify-center mb-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
          <Code className="h-5 w-5 text-orange-600" />
        </div>
      </div>
      
      <div className="text-center mb-2">
        <div className="font-medium text-sm mb-1">
          {data.label || "Code"}
        </div>
        <div className="text-xs text-muted-foreground">
          JavaScript execution
        </div>
      </div>

      <div className="flex justify-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Edit className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit JavaScript Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={tempCode}
                onChange={(e) => setTempCode(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Enter your JavaScript code here..."
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Code
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Handle type="source" position={Position.Right} className={getHandleStyle()} />
    </div>
  );
});

CodeNode.displayName = 'CodeNode';

export default CodeNode;
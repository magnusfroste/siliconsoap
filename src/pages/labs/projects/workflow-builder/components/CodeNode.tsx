import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code, Edit, Save, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CodeNodeData {
  label?: string;
  code?: string;
}

const defaultCode = `// Simple calculation example
const a = 10;
const b = 20;
const result = a + b;

console.log('Result:', result);
return result;`;

const CodeNode = memo(({ data }: { data: CodeNodeData }) => {
  const [code, setCode] = useState(data.code || defaultCode);
  const [isOpen, setIsOpen] = useState(false);
  const [tempCode, setTempCode] = useState(code);

  const handleSave = () => {
    setCode(tempCode);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempCode(code);
    setIsOpen(false);
  };

  const getCodePreview = () => {
    const lines = code.split('\n');
    return lines.length > 2 ? `${lines[0]}\n${lines[1]}\n...` : code;
  };

  return (
    <Card className="min-w-[220px] p-4 border-2 border-destructive/20 bg-background">
      <Handle type="target" position={Position.Left} className="!bg-destructive" />
      
      <div className="flex items-center gap-2 mb-2">
        <Code className="h-4 w-4 text-destructive" />
        <span className="font-medium text-sm">JavaScript Code</span>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto">
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
      
      <div className="text-xs text-muted-foreground mb-2">
        Custom JavaScript execution
      </div>
      
      <div className="bg-muted/50 p-2 rounded text-xs font-mono">
        <pre className="whitespace-pre-wrap overflow-hidden">
          {getCodePreview()}
        </pre>
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-destructive" />
    </Card>
  );
});

CodeNode.displayName = 'CodeNode';

export default CodeNode;
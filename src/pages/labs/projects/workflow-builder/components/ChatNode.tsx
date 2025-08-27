import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ChatNodeData {
  label?: string;
  message?: string;
}

const ChatNode = memo(({ data }: { data: ChatNodeData }) => {
  return (
    <Card className="min-w-[200px] p-4 border-2 border-primary/20 bg-background">
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Chat Input</span>
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        User message input
      </div>
      
      <div className="bg-muted/50 p-2 rounded text-xs">
        {data.message || "Enter your message..."}
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </Card>
  );
});

ChatNode.displayName = 'ChatNode';

export default ChatNode;
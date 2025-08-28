import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Search, Brain, Code, Play, Zap, Globe, Database, GitBranch, User, Webhook, Filter, Settings2 } from 'lucide-react';
import { Node } from '@xyflow/react';

interface NodeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (nodeType: string, title: string) => void;
}

const nodeCategories = [
  {
    title: 'AI Agent',
    icon: Brain,
    description: 'Interact with AI language models using OpenRouter API',
    nodeType: 'ai',
  },
  {
    title: 'Action in an app',
    icon: Globe,
    description: 'Do something in an app or service like Google Sheets, Telegram or Notion',
    nodeType: 'action',
  },
  {
    title: 'Data transformation',
    icon: Database,
    description: 'Manipulate, filter or convert data',
    nodeType: 'transform',
  },
  {
    title: 'Flow',
    icon: GitBranch,
    description: 'Branch, merge or loop the flow, etc.',
    nodeType: 'flow',
  },
  {
    title: 'HTTP Request',
    icon: Globe,
    description: 'Make HTTP requests to APIs and external services',
    nodeType: 'http',
  },
  {
    title: 'If',
    icon: GitBranch,
    description: 'Branch workflow based on conditions',
    nodeType: 'if',
  },
  {
    title: 'Set',
    icon: Settings2,
    description: 'Transform and manipulate data fields',
    nodeType: 'set',
  },
  {
    title: 'Filter',
    icon: Filter,
    description: 'Filter items based on conditions',
    nodeType: 'filter',
  },
  {
    title: 'Core',
    icon: Code,
    description: 'Run code, make HTTP requests, set webhooks, etc.',
    nodeType: 'code',
  },
  {
    title: 'Human in the loop',
    icon: User,
    description: 'Wait for approval or human input before continuing',
    nodeType: 'human',
  },
  {
    title: 'Add another trigger',
    icon: Zap,
    description: 'Triggers start your workflow. Workflows can have multiple triggers.',
    nodeType: 'manualTrigger',
  },
];

const NodeSelector: React.FC<NodeSelectorProps> = ({ isOpen, onClose, onAddNode }) => {
  const handleAddNode = (nodeType: string, title: string) => {
    onAddNode(nodeType, title);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>What happens next?</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            {nodeCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.nodeType}
                  onClick={() => handleAddNode(category.nodeType, category.title)}
                  className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1">{category.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                    <div className="mt-1">
                      <div className="w-4 h-4 text-muted-foreground group-hover:text-foreground">→</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NodeSelector;
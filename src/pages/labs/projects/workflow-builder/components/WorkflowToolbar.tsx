import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Trash2 } from 'lucide-react';

interface WorkflowToolbarProps {
  hasCredentials: boolean;
  isExecuting: boolean;
  onExecute: () => void;
  onStop?: () => void;
  onClear?: () => void;
}

const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
  hasCredentials,
  isExecuting,
  onExecute,
  onStop,
  onClear,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-20 px-4 py-3">
      <div className="flex items-center gap-3">
        <Button
          onClick={onExecute}
          disabled={!hasCredentials || isExecuting}
          className="bg-red-600 hover:bg-red-700 text-white px-6"
          size="lg"
        >
          {isExecuting ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Executing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Execute workflow
            </>
          )}
        </Button>
        
        {isExecuting && onStop && (
          <Button
            onClick={onStop}
            variant="outline"
            size="lg"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        )}
        
        {onClear && (
          <Button
            onClick={onClear}
            variant="outline"
            size="lg"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
        
        {!hasCredentials && (
          <div className="text-sm text-muted-foreground ml-auto">
            Please add your OpenRouter API key to execute workflows
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowToolbar;
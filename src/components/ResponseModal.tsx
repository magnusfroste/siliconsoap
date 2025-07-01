
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { parseMarkdown } from '@/pages/labs/hooks/utils';

interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
}

const ResponseModal: React.FC<ResponseModalProps> = ({ 
  isOpen, 
  onClose, 
  content, 
  title = "Full Response" 
}) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          <div 
            className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResponseModal;

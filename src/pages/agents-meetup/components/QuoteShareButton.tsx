import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Share2, Copy, Twitter, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { ConversationMessage } from '../types';
import { getAgentSoapName, getAgentLetter } from '../utils/agentNameGenerator';

interface QuoteShareButtonProps {
  message: ConversationMessage;
  chatUrl?: string;
}

export const QuoteShareButton = ({ message, chatUrl }: QuoteShareButtonProps) => {
  const soapName = getAgentSoapName(message.agent, message.persona);
  const agentLetter = getAgentLetter(message.agent);

  const formatQuote = () => {
    const quote = message.message.length > 280 
      ? message.message.slice(0, 277) + '...' 
      : message.message;
    return `"${quote}"\n\n— ${soapName} (${agentLetter}) · ${message.persona}`;
  };

  const formatTwitterQuote = () => {
    const maxLen = 200; // Leave room for link and attribution
    const quote = message.message.length > maxLen 
      ? message.message.slice(0, maxLen - 3) + '...' 
      : message.message;
    return `"${quote}" — ${soapName} 🫧`;
  };

  const handleCopyQuote = async () => {
    const quote = formatQuote();
    const textWithLink = chatUrl ? `${quote}\n\n${chatUrl}` : quote;
    
    try {
      await navigator.clipboard.writeText(textWithLink);
      toast.success('Quote copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShareTwitter = () => {
    const quote = formatTwitterQuote();
    const url = chatUrl ? encodeURIComponent(chatUrl) : '';
    const text = encodeURIComponent(quote);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}&via=SiliconSoap`,
      '_blank',
      'width=600,height=400'
    );
  };

  const handleShareLinkedIn = () => {
    if (chatUrl) {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(chatUrl)}`,
        '_blank',
        'width=600,height=400'
      );
    } else {
      handleCopyQuote();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleCopyQuote} className="gap-2 cursor-pointer">
          <Copy className="h-4 w-4" />
          Copy Quote
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareTwitter} className="gap-2 cursor-pointer">
          <Twitter className="h-4 w-4" />
          Tweet Quote
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareLinkedIn} className="gap-2 cursor-pointer">
          <Linkedin className="h-4 w-4" />
          Share on LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

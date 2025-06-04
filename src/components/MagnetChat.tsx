
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const MagnetChat = () => {
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Try to find and use the n8n chat widget first
      const chatButton = document.querySelector('.n8n-chat-toggle') as HTMLElement;
      if (chatButton) {
        chatButton.click();
        
        // Wait for chat to open and send message
        setTimeout(() => {
          const chatInputField = document.querySelector('.n8n-chat-input') as HTMLTextAreaElement;
          if (chatInputField) {
            chatInputField.value = chatInput;
            chatInputField.focus();
            
            // Trigger events to ensure the widget recognizes the input
            const inputEvent = new Event('input', { bubbles: true });
            const changeEvent = new Event('change', { bubbles: true });
            chatInputField.dispatchEvent(inputEvent);
            chatInputField.dispatchEvent(changeEvent);
            
            // Try to send the message
            setTimeout(() => {
              const sendButton = document.querySelector('.n8n-chat-send-button') as HTMLElement;
              if (sendButton) {
                sendButton.click();
                toast({
                  title: "Message sent!",
                  description: "Your message has been sent to Magnet.",
                });
              } else {
                // If no send button found, simulate Enter key press
                const enterEvent = new KeyboardEvent('keydown', {
                  key: 'Enter',
                  code: 'Enter',
                  bubbles: true
                });
                chatInputField.dispatchEvent(enterEvent);
                
                toast({
                  title: "Message sent!",
                  description: "Your message has been sent to Magnet.",
                });
              }
            }, 300);
          }
        }, 1000);
      } else {
        // Fallback: Send directly to webhook if chat widget not available
        const webhookUrl = "https://agent.froste.eu/webhook/3092ebad-b671-44ad-8b3d-b4d12b7ea76b/chat";
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'sendMessage',
            sessionId: 'web-session',
            chatInput: chatInput
          }),
        });

        if (response.ok) {
          toast({
            title: "Message sent!",
            description: "Your message has been sent to Magnet.",
          });
        } else {
          throw new Error('Failed to send message');
        }
      }
      
      setChatInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try the chat widget directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-16 animate-fade-in">
      <div className="glass-card p-6">
        <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-apple-purple to-apple-blue bg-clip-text text-transparent">
          Chat with Magnet - My Digital Twin
        </h3>
        <p className="text-gray-600 mb-6">
          Ask me anything about innovation, strategy, or AI integration. I'm here to help!
        </p>
        
        <div className="relative">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Magnet about innovation, strategy, AI, or anything else..."
            className="w-full bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-4 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all min-h-[60px] max-h-[120px]"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={handleChatSubmit}
            disabled={!chatInput.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-apple-purple hover:bg-apple-purple/90 text-white rounded-xl px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {[
            "Tell me about your innovation approach",
            "How can AI transform my business?",
            "What's your strategy methodology?",
            "Share insights on digital transformation"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setChatInput(suggestion)}
              disabled={isLoading}
              className="px-4 py-2 bg-apple-light-purple text-apple-purple rounded-full text-sm hover:bg-apple-purple hover:text-white transition-all disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MagnetChat;

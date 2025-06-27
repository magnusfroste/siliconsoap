
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface AppleChatProps {
  webhookUrl: string;
}

const AppleChat: React.FC<AppleChatProps> = ({ webhookUrl }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Magnet, Magnus' digital twin. Ask me anything about innovation, strategy, or AI!",
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true
    };

    console.log('Sending message:', inputValue);
    console.log('Webhook URL:', webhookUrl);
    console.log('Session ID:', sessionId);

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const requestBody = { 
        message: inputValue,
        session_id: sessionId
      };
      console.log('Request body:', JSON.stringify(requestBody));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to send message'}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Handle different response formats
      let botResponse = "I'm sorry, I couldn't process that request.";
      
      if (Array.isArray(data) && data.length > 0) {
        // If response is an array, take the first item's output
        botResponse = data[0]?.output || data[0]?.message || data[0];
      } else if (data.output) {
        // If response has output property
        botResponse = data.output;
      } else if (data.message) {
        // If response has message property
        botResponse = data.message;
      } else if (typeof data === 'string') {
        // If response is a string
        botResponse = data;
      } else {
        console.warn('Unexpected response format:', data);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false
      };

      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "Message sent successfully",
        description: "Magnet has responded!",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Add error message to chat
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${errorMessage}. Please check the console for more details.`,
        isUser: false
      };
      
      setMessages(prev => [...prev, errorBotMessage]);
      
      toast({
        title: "Error",
        description: `Failed to send message: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card bg-white bg-opacity-90 backdrop-blur-xl border border-gray-200 rounded-3xl overflow-hidden shadow-apple">
        {/* Header */}
        <div className="bg-gradient-to-r from-apple-purple to-apple-blue p-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            Chat with Magnet
          </h3>
          <p className="text-white text-opacity-90 text-sm">
            Your AI-powered innovation strategist
          </p>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.isUser
                    ? 'bg-apple-blue text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-apple-purple" />
                  <span className="text-sm text-gray-600">Magnet is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about innovation, strategy, or AI..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent resize-none text-sm"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-apple-blue hover:bg-blue-600 text-white rounded-full p-3 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppleChat;

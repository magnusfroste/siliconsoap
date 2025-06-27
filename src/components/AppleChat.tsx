import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { parseMarkdown } from '@/pages/labs/hooks/utils';
import ResponseModal from './ResponseModal';
import TruncatedMessage from './TruncatedMessage';

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
      text: "Hi! I'm Magnet, Magnus' digital twin. Ask me anything about innovation, product strategy or AI!",
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [modalContent, setModalContent] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isLongResponse = (text: string) => {
    return text.length > 300 || text.split('\n').length > 5;
  };

  const handleViewFullResponse = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const sendPrefilledMessage = async (message: string) => {
    if (isLoading) return;
    
    setInputValue(message);
    
    // Small delay to show the message being set, then send it
    setTimeout(() => {
      sendMessageWithText(message);
    }, 100);
  };

  const sendMessageWithText = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true
    };

    console.log('Sending message:', messageText);
    console.log('Webhook URL:', webhookUrl);
    console.log('Session ID:', sessionId);

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const requestBody = { 
        message: messageText,
        sessionId: sessionId
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to send message'}`);
      }

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!responseText || responseText.trim() === '') {
        console.warn('Empty response from webhook');
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      let botResponse = "I'm sorry, I couldn't process that request.";
      
      if (Array.isArray(data) && data.length > 0) {
        botResponse = data[0]?.output || data[0]?.message || data[0];
      } else if (data.output) {
        botResponse = data.output;
      } else if (data.message) {
        botResponse = data.message;
      } else if (typeof data === 'string') {
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
      
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${errorMessage}. Please check the webhook configuration.`,
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

  const sendMessage = async () => {
    await sendMessageWithText(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: "AI Strategy", message: "outline an ai strategy" },
    { label: "Magnus Resume", message: "show magnus resume" },
    { label: "AI Agents", message: "tell me about ai agents" }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-card bg-white bg-opacity-90 backdrop-blur-xl border border-gray-200 rounded-3xl overflow-hidden shadow-apple">
        {/* Quick Action Buttons */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex gap-2 justify-center flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                onClick={() => sendPrefilledMessage(action.message)}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-apple-light-blue hover:text-apple-blue border-gray-200 text-gray-700 text-xs px-3 py-1 h-7"
              >
                <Zap className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="h-80 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white scroll-smooth"
        >
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
                {message.isUser ? (
                  <p className="text-sm leading-relaxed">{message.text}</p>
                ) : (
                  <>
                    {isLongResponse(message.text) ? (
                      <TruncatedMessage
                        content={message.text}
                        onViewFull={() => handleViewFullResponse(message.text)}
                      />
                    ) : (
                      <div 
                        className="text-sm leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
                      />
                    )}
                  </>
                )}
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

      <ResponseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={modalContent}
        title="Full Response from Magnet"
      />
    </div>
  );
};

export default AppleChat;


import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface UseChatProps {
  webhookUrl: string;
}

export const useChat = ({ webhookUrl }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Magnet, Magnus' digital twin. Ask me anything about innovation, strategy, or AI!",
      isUser: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true
    };

    console.log('Sending message:', inputValue);
    console.log('Webhook URL:', webhookUrl);

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const requestBody = { 
        message: inputValue
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

  return {
    messages,
    inputValue,
    isLoading,
    setInputValue,
    sendMessage,
  };
};

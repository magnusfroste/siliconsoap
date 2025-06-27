
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    isUser: boolean;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
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
  );
};

export const LoadingMessage: React.FC = () => (
  <div className="flex justify-start">
    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-apple-purple" />
        <span className="text-sm text-gray-600">Magnet is thinking...</span>
      </div>
    </div>
  </div>
);

export default ChatMessage;

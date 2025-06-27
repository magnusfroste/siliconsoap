
import React from 'react';
import { useChat } from '@/hooks/useChat';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';

interface AppleChatProps {
  webhookUrl: string;
}

const AppleChat: React.FC<AppleChatProps> = ({ webhookUrl }) => {
  const {
    messages,
    inputValue,
    isLoading,
    setInputValue,
    sendMessage,
  } = useChat({ webhookUrl });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card bg-white bg-opacity-90 backdrop-blur-xl border border-gray-200 rounded-3xl overflow-hidden shadow-apple">
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput
          inputValue={inputValue}
          isLoading={isLoading}
          onInputChange={setInputValue}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
};

export default AppleChat;

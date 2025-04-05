
import React, { useEffect, useState } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';
import { toast } from '@/hooks/use-toast';

interface ChatWidgetProps {
  webhookUrl: string;
  greeting?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  webhookUrl, 
  greeting = "Lets chat and find out..."
}) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (webhookUrl && !initialized) {
      try {
        console.log('Initializing chat with webhook URL:', webhookUrl);
        console.log('Using greeting message:', greeting);
        
        // Apply Appli-inspired custom CSS variables
        const chatStyles = document.createElement('style');
        chatStyles.textContent = `
          :root {
            --chat--color-primary: #9b87f5;
            --chat--color-primary-shade-50: #8b78e0;
            --chat--color-primary-shade-100: #7e69ab;
            --chat--color-secondary: #0EA5E9;
            --chat--color-secondary-shade-50: #0990cf;
            --chat--color-secondary-shade-100: #0880b5;
            --chat--color-white: #ffffff;
            --chat--color-light: #F8F9FB;
            --chat--color-light-shade-50: #F0F4F8;
            --chat--color-light-shade-100: #E5DEFF;
            --chat--color-medium: #d2d4d9;
            --chat--color-dark: #1A1F2C;
            --chat--color-disabled: #777980;
            --chat--color-typing: #333333;

            --chat--spacing: 1rem;
            --chat--border-radius: 1rem;
            --chat--transition-duration: 0.15s;

            --chat--window--width: 600px;
            --chat--window--height: 800px;

            --chat--header-height: auto;
            --chat--header--padding: var(--chat--spacing);
            --chat--header--background: #9b87f5;
            --chat--header--color: var(--chat--color-white);
            --chat--header--border-top: none;
            --chat--header--border-bottom: none;
            --chat--heading--font-size: 1.5em;
            --chat--subtitle--font-size: 0.9em;
            --chat--subtitle--line-height: 1.5;

            --chat--textarea--height: 50px;

            --chat--message--font-size: 0.9rem;
            --chat--message--padding: var(--chat--spacing);
            --chat--message--border-radius: var(--chat--border-radius);
            --chat--message-line-height: 1.6;
            --chat--message--bot--background: var(--chat--color-white);
            --chat--message--bot--color: var(--chat--color-dark);
            --chat--message--bot--border: none;
            --chat--message--user--background: #0EA5E9;
            --chat--message--user--color: var(--chat--color-white);
            --chat--message--user--border: none;
            --chat--message--pre--background: rgba(0, 0, 0, 0.05);

            --chat--toggle--background: #9b87f5;
            --chat--toggle--hover--background: #8b78e0;
            --chat--toggle--active--background: #7e69ab;
            --chat--toggle--color: var(--chat--color-white);
            --chat--toggle--size: 60px;
          }
          
          /* Add attention-grabbing animation to the chat toggle button */
          .n8n-chat-toggle {
            animation: pulse-chat 2s infinite;
            box-shadow: 0 0 0 rgba(155, 135, 245, 0.6);
          }
          
          @keyframes pulse-chat {
            0% {
              box-shadow: 0 0 0 0 rgba(155, 135, 245, 0.6);
              transform: scale(1);
            }
            70% {
              box-shadow: 0 0 0 15px rgba(155, 135, 245, 0);
              transform: scale(1.05);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(155, 135, 245, 0);
              transform: scale(1);
            }
          }
          
          /* Add a hint message that appears near hero section */
          .chat-hint {
            position: fixed;
            bottom: 120px;
            right: 30px;
            background: #9b87f5;
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 999;
            animation: fade-in-out 5s forwards;
            pointer-events: none;
          }
          
          .chat-hint::after {
            content: '';
            position: absolute;
            bottom: -10px;
            right: 20px;
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid #9b87f5;
          }
          
          @keyframes fade-in-out {
            0% { opacity: 0; transform: translateY(20px); }
            10% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; }
            100% { opacity: 0; }
          }
        `;
        document.head.appendChild(chatStyles);
        
        // Create chat with properly configured i18n options
        createChat({
          webhookUrl: webhookUrl,
          initialMessages: [greeting],
          i18n: {
            en: {
              title: "Hi, I'm 'Magnet', Magnus digital twin!", 
              subtitle: "I can help with a lot as an agentic AI bot...",
              footer: '',
              getStarted: 'New Conversation',
              inputPlaceholder: 'Type your question..',
              closeButtonTooltip: 'Close chat', 
            },
          },
          theme: {
            chatWindow: {
              welcomeMessage: greeting, 
            }
          }
        });
        
        // Add a temporary hint message that appears for a few seconds
        setTimeout(() => {
          const chatHint = document.createElement('div');
          chatHint.className = 'chat-hint';
          chatHint.textContent = 'Chat with Magnus!';
          document.body.appendChild(chatHint);
          
          // Remove the hint after animation completes
          setTimeout(() => {
            chatHint.remove();
          }, 5000);
        }, 2000);
        
        setInitialized(true);
        console.log('Chat initialization completed');
      } catch (error) {
        // Handle any errors that occur during initialization
        console.error('Error initializing chat:', error);
        toast({
          title: "Chat Widget Error",
          description: "Could not connect to chat service. Please try again later.",
          variant: "destructive",
        });
      }
    }
  }, [webhookUrl, initialized, greeting]);

  return null;
};

export default ChatWidget;

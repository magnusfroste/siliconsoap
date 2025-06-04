
import React, { useEffect, useState, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';
import { toast } from '@/hooks/use-toast';

interface ChatWidgetProps {
  webhookUrl: string;
  greeting?: string;
  enableSpeech?: boolean;
  mode?: 'floating' | 'embedded';
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  webhookUrl, 
  greeting = "Lets chat and find out...",
  enableSpeech = false,
  mode = 'floating'
}) => {
  const [initialized, setInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const MAX_RETRIES = 3;
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window === 'undefined' || !enableSpeech) return;
    
    speechSynthRef.current = window.speechSynthesis;
    
    if (!speechSynthRef.current) return;
    
    const loadVoices = () => {
      setVoicesLoaded(true);
    };
    
    // Check if voices are already available
    if (speechSynthRef.current.getVoices().length > 0) {
      setVoicesLoaded(true);
    }
    
    // Add event listener for when voices are loaded
    speechSynthRef.current.addEventListener('voiceschanged', loadVoices);
    
    // Fallback for browsers that don't fire voiceschanged
    const timer = setTimeout(() => {
      if (speechSynthRef.current && speechSynthRef.current.getVoices().length > 0) {
        setVoicesLoaded(true);
      }
    }, 1000);
    
    return () => {
      stopSpeaking(); // Ensure any speech is stopped when component unmounts
      if (speechSynthRef.current) {
        speechSynthRef.current.removeEventListener('voiceschanged', loadVoices);
      }
      clearTimeout(timer);
      
      // Clean up mutation observer
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, [enableSpeech]);

  const speakMessage = (text: string) => {
    const synth = speechSynthRef.current;
    if (!synth || !enableSpeech || !voicesLoaded) return;
    
    try {
      // Cancel any ongoing speech first
      stopSpeaking();
      
      const cleanText = text.replace(/<[^>]*>?/gm, '');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance; // Store reference
      
      utterance.lang = 'en-US';
      
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Samantha') || 
          voice.name.includes('Google') || 
          voice.name.includes('Female') ||
          (voice.lang === 'en-US' && voice.name.includes('Female'))
        );
        if (preferredVoice) utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      
      utterance.onerror = (error) => {
        // Only log and show toast for non-cancellation errors
        if (error.error !== 'canceled' && error.error !== 'interrupted') {
          console.error("Speech synthesis error in ChatWidget:", error);
          
          toast({
            title: "Text-to-Speech Error",
            description: "There was an error playing the audio.",
            variant: "default",
          });
        }
        
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      
      // Add a slight delay to ensure previous speech is properly canceled
      setTimeout(() => {
        try {
          // Check if the component is still mounted
          if (speechSynthRef.current && document.body.contains(document.querySelector('.n8n-chat'))) {
            speechSynthRef.current.speak(utterance);
          }
        } catch (error) {
          console.error("Error starting speech in ChatWidget:", error);
          setIsSpeaking(false);
          utteranceRef.current = null;
        }
      }, 150);
    } catch (error) {
      console.error("Error setting up speech in ChatWidget:", error);
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  };
  
  const stopSpeaking = () => {
    const synth = speechSynthRef.current;
    if (!synth) return;
    
    try {
      synth.cancel();
      
      // Reset state after a small delay
      setTimeout(() => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      }, 50);
    } catch (error) {
      console.error("Error cancelling speech:", error);
      // Still reset state
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  };

  useEffect(() => {
    if (webhookUrl && !initialized && retryCount < MAX_RETRIES) {
      try {
        console.log('Initializing chat with webhook URL:', webhookUrl);
        console.log('Using greeting message:', greeting);
        console.log('Chat mode:', mode);
        
        // Initialize chat styles and configuration
        const initializeChat = () => {
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
              --chat--textarea--display: block !important;
              --chat--textarea--visibility: visible !important;
              --chat--textarea--opacity: 1 !important;

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
            
            ${mode === 'floating' ? `
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
            ` : ''}
            
            .n8n-chat-footer {
              display: none !important;
            }
            
            .n8n-chat-compose {
              display: flex !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            
            .n8n-chat-input {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              min-height: 50px !important;
            }

            ${enableSpeech ? `
            .speech-button {
              position: absolute;
              bottom: 12px;
              right: 55px;
              background: none;
              border: none;
              color: #9b87f5;
              cursor: pointer;
              padding: 4px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .speech-button:hover {
              background-color: rgba(155, 135, 245, 0.1);
            }
            
            .speech-button svg {
              width: 20px;
              height: 20px;
            }
            ` : ''}
            
            .chat-hint {
              position: fixed;
              bottom: 160px;
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
              max-width: 200px;
              text-align: center;
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
          
          createChat({
            webhookUrl: webhookUrl,
            initialMessages: [greeting],
            i18n: {
              en: {
                title: "Hi, I'm 'Magnet'!", 
                subtitle: "Magnus Agentic Digital Twin",
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
          
          setTimeout(() => {
            const chatInput = document.querySelector('.n8n-chat-input');
            const chatCompose = document.querySelector('.n8n-chat-compose');
            
            if (chatInput && chatInput instanceof HTMLElement) {
              chatInput.style.display = 'block';
              chatInput.style.visibility = 'visible';
              chatInput.style.opacity = '1';
            }
            
            if (chatCompose && chatCompose instanceof HTMLElement) {
              chatCompose.style.display = 'flex';
              chatCompose.style.visibility = 'visible';
              chatCompose.style.opacity = '1';
            }

            if (enableSpeech) {
              const addSpeechButtons = () => {
                // Stop any ongoing speech before adding new buttons
                stopSpeaking();
                
                document.querySelectorAll('.n8n-chat-message--bot').forEach((message) => {
                  if (!message.querySelector('.speech-button')) {
                    const text = message.textContent || '';
                    const button = document.createElement('button');
                    button.className = 'speech-button';
                    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
                    button.title = 'Read message aloud';
                    
                    // Add user interaction requirement for speech with proper cleanup
                    button.onclick = (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Stop any currently playing audio first
                      stopSpeaking();
                      
                      if (voicesLoaded) {
                        // Add slight delay before playing new audio
                        setTimeout(() => {
                          speakMessage(text);
                        }, 100);
                      } else {
                        toast({
                          title: "Text-to-Speech",
                          description: "Voice data is still loading. Please try again in a moment.",
                          variant: "default",
                        });
                      }
                    };
                    
                    if (message instanceof HTMLElement) {
                      message.style.position = 'relative';
                      message.appendChild(button);
                    }
                  }
                });
              };

              // Delay adding speech buttons to ensure DOM is ready
              setTimeout(addSpeechButtons, 2000);

              const chatContainer = document.querySelector('.n8n-chat-messages');
              if (chatContainer) {
                // Clean up any previous observer
                if (mutationObserverRef.current) {
                  mutationObserverRef.current.disconnect();
                }
                
                // Create new observer
                mutationObserverRef.current = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                      // Delay to ensure the new elements are fully rendered
                      setTimeout(addSpeechButtons, 200);
                    }
                  }
                });
                
                // Start observing
                mutationObserverRef.current.observe(chatContainer, { childList: true, subtree: true });
              }
              
              // Add event listener to chat window close button to stop speech
              setTimeout(() => {
                const closeButton = document.querySelector('.n8n-chat-header-close-button');
                if (closeButton) {
                  closeButton.addEventListener('click', () => {
                    stopSpeaking();
                  });
                }
              }, 2000);
            }
          }, 1500);
          
          setTimeout(() => {
            const chatHint = document.createElement('div');
            chatHint.className = 'chat-hint';
            chatHint.textContent = 'Chat with Magnet!';
            document.body.appendChild(chatHint);
            
            setTimeout(() => {
              chatHint.remove();
            }, 5000);
          }, 2000);
          
          setInitialized(true);
          console.log('Chat initialization completed');
        };
        
        // Initialize chat directly without API checks
        initializeChat();
        
      } catch (error) {
        console.error('Error initializing chat:', error);
        
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        
        if (nextRetryCount < MAX_RETRIES) {
          console.log(`Retry attempt ${nextRetryCount} of ${MAX_RETRIES} in 2 seconds...`);
          setTimeout(() => {
            setInitialized(false);
          }, 2000);
        } else {
          toast({
            title: "Chat Widget Error",
            description: "Could not connect to chat service. Please try again later.",
            variant: "destructive",
          });
        }
      }
    }
  }, [webhookUrl, initialized, retryCount, greeting, enableSpeech, mode, voicesLoaded]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking(); // Use the improved stop speaking function
      
      // Clean up mutation observer
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, []);

  return null;
};

export default ChatWidget;

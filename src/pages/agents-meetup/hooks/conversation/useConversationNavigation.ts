import { useState } from 'react';

export type ViewState = 'input' | 'conversation' | 'analysis';

export const useConversationNavigation = () => {
  const [currentView, setCurrentView] = useState<ViewState>('input');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return {
    currentView,
    setCurrentView,
    settingsOpen,
    setSettingsOpen
  };
};

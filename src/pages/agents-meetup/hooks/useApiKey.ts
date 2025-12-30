import { useState } from 'react';

// Simplified hook - shared key mode only
export const useApiKey = () => {
  // Always use shared key mode (empty string = edge function with shared key)
  const [apiKey] = useState<string>('');

  // Get the active API key to use for API calls (always empty = shared key)
  const getActiveApiKey = (): string => '';

  return {
    apiKey,
    setApiKey: () => {},
    savedApiKey: '',
    setSavedApiKey: () => {},
    userApiKey: null,
    isSaving: false,
    setIsSaving: () => {},
    isSaved: false,
    setIsSaved: () => {},
    isUsingEnvKey: false,
    isUsingSharedKey: true,
    saveApiKey: () => {},
    deleteApiKey: () => {},
    validateApiKey: async () => true,
    getActiveApiKey,
    setUserApiKey: () => {},
    enableSharedKeyMode: () => {},
  };
};

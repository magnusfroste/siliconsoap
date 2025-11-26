import { useState, useEffect } from 'react';
import { checkApiAvailability } from '@/utils/openRouter';
import { toast } from '@/hooks/use-toast';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [savedApiKey, setSavedApiKey] = useState<string>('');
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isUsingEnvKey, setIsUsingEnvKey] = useState<boolean>(false);
  const [isUsingSharedKey, setIsUsingSharedKey] = useState<boolean>(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedUserApiKey = localStorage.getItem('userOpenRouterApiKey');
    
    if (storedUserApiKey) {
      console.log("Found user API key in localStorage");
      setUserApiKey(storedUserApiKey);
      setApiKey(storedUserApiKey);
      setSavedApiKey(storedUserApiKey);
      setIsSaved(true);
      setIsUsingEnvKey(false);
      setIsUsingSharedKey(false);
    } else {
      console.log("No user API key found in localStorage, using shared key mode");
      setUserApiKey(null);
      setApiKey('');
      setSavedApiKey('');
      setIsSaved(false);
      setIsUsingEnvKey(false);
      setIsUsingSharedKey(true); // Enable shared key mode by default
    }
  }, []);

  // Validate API key with OpenRouter
  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      console.log("Validating API key...");
      const result = await checkApiAvailability(key);
      console.log("API key validation result:", result);
      return result.available;
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  };

  // Save API key to localStorage
  const saveApiKey = (key: string) => {
    try {
      console.log("Saving API key to localStorage");
      localStorage.setItem('userOpenRouterApiKey', key);
      setUserApiKey(key);
      setSavedApiKey(key);
      setIsSaved(true);
      setIsUsingEnvKey(false);
    } catch (error) {
      console.error("Error saving API key to localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete API key from localStorage
  const deleteApiKey = () => {
    try {
      console.log("Deleting API key from localStorage");
      localStorage.removeItem('userOpenRouterApiKey');
      setUserApiKey(null);
      setApiKey('');
      setSavedApiKey('');
      setIsSaved(false);
      setIsUsingEnvKey(false);
      setIsUsingSharedKey(true); // Enable shared key mode after deletion

      // Also clear any stored rate limit status
      localStorage.removeItem('openRouterRateLimitStatus');

      toast({
        title: "API Key Deleted",
        description: "Your API key has been removed. Now using shared API.",
      });
    } catch (error) {
      console.error("Error deleting API key from localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get the active API key to use for API calls
  const getActiveApiKey = (): string => {
    // Return user's API key or null (for shared key mode)
    return userApiKey || '';
  };

  // Enable shared key mode (no user API key needed)
  const enableSharedKeyMode = () => {
    setIsUsingSharedKey(true);
    setUserApiKey(null);
    setApiKey('');
    setSavedApiKey('');
    setIsSaved(false);
  };

  // Prompt user to add their own API key
  const promptForBYOK = () => {
    setIsUsingSharedKey(false);
    toast({
      title: "API Key Required",
      description: "Shared API key limit reached. Please add your own OpenRouter API key to continue.",
      variant: "destructive",
    });
  };

  return {
    apiKey,
    setApiKey,
    savedApiKey,
    setSavedApiKey,
    userApiKey,
    isSaving,
    setIsSaving,
    isSaved,
    setIsSaved,
    isUsingEnvKey,
    isUsingSharedKey,
    saveApiKey,
    deleteApiKey,
    validateApiKey,
    getActiveApiKey,
    setUserApiKey,
    enableSharedKeyMode,
    promptForBYOK
  };
};

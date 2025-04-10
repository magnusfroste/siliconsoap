import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [savedApiKey, setSavedApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [userApiKey, setUserApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isUsingEnvKey, setIsUsingEnvKey] = useState(false);

  useEffect(() => {
    // Use environment variable API key if present, otherwise try localStorage
    const envApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (envApiKey) {
      setApiKey(envApiKey);
      setSavedApiKey(envApiKey);
      setIsUsingEnvKey(true);
      // Store in localStorage as well for client-side persistence
      localStorage.setItem('openRouterApiKey', envApiKey);
    } else {
      // Fallback to localStorage if no environment variable
      const storedApiKey = localStorage.getItem('openRouterApiKey');
      if (storedApiKey) {
        setApiKey(storedApiKey);
        setSavedApiKey(storedApiKey);
      }
    }

    // Also check for user-provided API key
    const storedUserApiKey = localStorage.getItem('userOpenRouterApiKey');
    if (storedUserApiKey) {
      setUserApiKey(storedUserApiKey);
    }
    
    console.log("Initial API keys setup - Environment key exists:", !!envApiKey);
    console.log("Initial API keys setup - User key exists:", !!storedUserApiKey);
  }, []);

  const saveApiKey = () => {
    setIsSaving(true);
    
    // Don't allow saving empty API keys
    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenRouter API key.",
        variant: "destructive",
      });
      setIsSaving(false);
      return false;
    }
    
    // Validate that it's an OpenRouter key
    if (!apiKey.startsWith('sk-or-')) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenRouter API key (starting with 'sk-or-').",
        variant: "destructive",
      });
      setIsSaving(false);
      return false;
    }
    
    console.log("Saving API key:", apiKey.substring(0, 10) + "...");
    
    // Save to localStorage - this is crucial for paid models
    localStorage.setItem('userOpenRouterApiKey', apiKey);
    setUserApiKey(apiKey);
    localStorage.setItem('openRouterApiKey', apiKey);
    setSavedApiKey(apiKey);
    
    toast({
      title: "API Key Saved",
      description: "Your OpenRouter API key has been saved.",
      variant: "default",
    });
    
    setIsSaving(false);
    setIsSaved(true);
    
    // Reset isSaved after a timeout
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);

    return true;
  };

  const getActiveApiKey = (modelIsFree = true) => {
    console.log("getActiveApiKey called for", modelIsFree ? "free model" : "paid model");
    console.log("User API key:", userApiKey ? "exists" : "doesn't exist");
    console.log("Environment API key:", import.meta.env.VITE_OPENROUTER_API_KEY ? "exists" : "doesn't exist");
    
    // For free models, prefer the env API key
    if (modelIsFree && import.meta.env.VITE_OPENROUTER_API_KEY) {
      return import.meta.env.VITE_OPENROUTER_API_KEY;
    }
    
    // For non-free models, require the user's API key
    if (!modelIsFree && userApiKey) {
      return userApiKey;
    }
    
    // Otherwise, fallback to any available key
    return userApiKey || savedApiKey;
  };

  return {
    apiKey,
    setApiKey,
    savedApiKey,
    setSavedApiKey,
    userApiKey,
    setUserApiKey,
    isSaving,
    setIsSaving,
    isSaved,
    setIsSaved,
    isUsingEnvKey,
    saveApiKey,
    getActiveApiKey
  };
};

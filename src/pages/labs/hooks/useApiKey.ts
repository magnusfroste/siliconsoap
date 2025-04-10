import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [savedApiKey, setSavedApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [userApiKey, setUserApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isUsingEnvKey, setIsUsingEnvKey] = useState(false);
  const [keyIsValidated, setKeyIsValidated] = useState(false);

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
      setKeyIsValidated(true); // If we have a stored user API key, consider it initially validated
      console.log("Loaded user API key from localStorage:", 
        storedUserApiKey ? `${storedUserApiKey.substring(0, 8)}...` : "none");
    }
    
    console.log("Initial API keys setup - Environment key exists:", !!envApiKey);
    console.log("Initial API keys setup - User key exists:", !!storedUserApiKey);
  }, []);

  // Validate OpenRouter API key format
  const isValidApiKeyFormat = (key: string): boolean => {
    return key.trim().startsWith('sk-or-');
  };

  // Verify API key with OpenRouter
  const validateApiKey = async (key: string): Promise<boolean> => {
    if (!isValidApiKeyFormat(key)) {
      return false;
    }
    
    try {
      // Use a simple request to check if the API key is valid
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Magnus Froste Labs'
        }
      });
      
      if (response.ok) {
        setKeyIsValidated(true);
        return true;
      }
      
      console.error("API key validation failed with status:", response.status);
      return false;
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  };

  const saveApiKey = async (): Promise<boolean> => {
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
    
    // Validate that it's an OpenRouter key format
    if (!isValidApiKeyFormat(apiKey)) {
      toast({
        title: "Invalid API Key Format",
        description: "Please enter a valid OpenRouter API key (starting with 'sk-or-').",
        variant: "destructive",
      });
      setIsSaving(false);
      return false;
    }
    
    console.log("Saving API key:", `${apiKey.substring(0, 10)}...`);
    
    // Validate the key with OpenRouter
    const isValid = await validateApiKey(apiKey);
    if (!isValid) {
      toast({
        title: "API Key Validation Failed",
        description: "Your API key format is correct but could not be validated with OpenRouter. Please check the key and try again.",
        variant: "destructive",
      });
      setIsSaving(false);
      return false;
    }
    
    // Save to localStorage - this is crucial for paid models
    localStorage.setItem('userOpenRouterApiKey', apiKey);
    setUserApiKey(apiKey);
    
    // Also save as the general API key
    localStorage.setItem('openRouterApiKey', apiKey);
    setSavedApiKey(apiKey);
    
    toast({
      title: "API Key Saved and Validated",
      description: "Your OpenRouter API key has been saved and validated successfully. You can now use paid models.",
      variant: "default",
    });
    
    setIsSaving(false);
    setIsSaved(true);
    setKeyIsValidated(true);
    
    // Reset isSaved after a timeout
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);

    return true;
  };

  const getActiveApiKey = (modelIsFree = true) => {
    console.log("getActiveApiKey called for", modelIsFree ? "free model" : "paid model");
    console.log("User API key exists:", !!userApiKey);
    console.log("User API key validated:", keyIsValidated);
    console.log("Environment API key exists:", !!import.meta.env.VITE_OPENROUTER_API_KEY);
    
    // For paid models, always use the user's validated API key first
    if (!modelIsFree) {
      if (userApiKey && keyIsValidated) {
        console.log("Using validated user API key for paid model");
        return userApiKey;
      } else {
        console.log("Warning: Paid model requested but no validated user API key found");
        // No need to show toast here, as the actual API call will handle this
        return null;
      }
    }
    
    // For free models, prefer the env API key if it exists
    if (modelIsFree && import.meta.env.VITE_OPENROUTER_API_KEY) {
      console.log("Using env API key for free model");
      return import.meta.env.VITE_OPENROUTER_API_KEY;
    }
    
    // If user has saved their API key, use it as a fallback for free models
    if (userApiKey && keyIsValidated) {
      console.log("Using validated user API key as fallback for free model");
      return userApiKey;
    }
    
    // Otherwise, use any available saved key
    console.log("Using saved API key");
    return savedApiKey;
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
    keyIsValidated,
    saveApiKey,
    getActiveApiKey
  };
};

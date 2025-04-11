import { toast } from "@/hooks/use-toast";
import { ApiError } from "../types";
import { OPENROUTER_API_URL } from "../constants";

/**
 * Checks if the API is available and if free credits are remaining
 * @returns Object with status and message
 */
export const checkApiAvailability = async (
  apiKey: string
): Promise<{ available: boolean; message: string }> => {
  try {
    // Use the simplest possible model and prompt to minimize token usage
    const testModel = "nvidia/llama-3.1-nemotron-nano-8b-v1:free";
    const testPrompt = "Hi";
    
    console.log("Testing API availability with minimal request");
    console.log("API key provided:", apiKey ? `${apiKey.substring(0, 8)}...` : "none");

    // If no API key, fail immediately
    if (!apiKey) {
      console.error("No API key available for availability check");
      return { 
        available: false, 
        message: "No API key available. Please provide an OpenRouter API key." 
      };
    }
    
    console.log("Checking API availability using API key:", 
      apiKey ? `${apiKey.substring(0, 8)}...` : "none");
    console.log("Using API URL:", OPENROUTER_API_URL);

    // Check if we have a stored rate limit status for this specific API key
    const rateLimitKey = 'openRouterRateLimitStatus';
    const storedRateLimitStatus = localStorage.getItem(rateLimitKey);
    
    if (storedRateLimitStatus) {
      try {
        const rateLimitStatus = JSON.parse(storedRateLimitStatus);
        const now = Date.now();
        
        // If we have a recent rate limit (within the last 5 minutes), return immediately
        if (rateLimitStatus.timestamp > now - 5 * 60 * 1000 && 
            rateLimitStatus.isRateLimited) {
          console.log("Using cached rate limit status - API is rate limited");
          return {
            available: false,
            message: "Your API key has reached its rate limit. Please try again later or use a different API key."
          };
        }
      } catch (e) {
        console.error("Error parsing stored rate limit status:", e);
        localStorage.removeItem(rateLimitKey);
      }
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Magnus Froste Labs"
      },
      body: JSON.stringify({
        model: testModel,
        messages: [{ role: "user", content: testPrompt }],
        temperature: 0.7,
        max_tokens: 5, // Request only a few tokens to minimize usage
      }),
    });

    if (!response.ok) {
      let errorMessage = "API request failed";
      
      try {
        const errorData = await response.json() as ApiError;
        console.error("API availability check failed:", errorData);
        console.error("Status code:", response.status);
        
        // Use the error message from the API if available
        errorMessage = errorData.message || errorMessage;
        
        // Handle rate limit specifically
        if (response.status === 429) {
          console.error("Rate limit detected during availability check:", errorData);
          
          // Store the rate limit status in localStorage
          localStorage.setItem(rateLimitKey, JSON.stringify({
            isRateLimited: true,
            timestamp: Date.now()
          }));
          
          return { 
            available: false, 
            message: "Your API key has reached its rate limit. Please try again later or use a different API key."
          };
        }
      } catch (e) {
        // If we couldn't parse the JSON, use a generic error message
        console.error("Error parsing API error response:", e);
      }
      
      return { 
        available: false, 
        message: errorMessage
      };
    }

    // If we get here, the API is available
    console.log("API availability check successful");
    
    // Update the rate limit status in localStorage to indicate no rate limit
    localStorage.setItem(rateLimitKey, JSON.stringify({
      isRateLimited: false,
      timestamp: Date.now()
    }));
    
    return { available: true, message: "API is available" };
  } catch (error) {
    console.error("Error checking API availability:", error);
    return { 
      available: false, 
      message: error instanceof Error ? error.message : "Unknown error checking API availability"
    };
  }
};

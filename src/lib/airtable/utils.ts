
// Base URL for Airtable API
export const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

// Get stored Airtable credentials
export const getAirtableConfig = () => {
  const apiKey = localStorage.getItem('VITE_AIRTABLE_API_KEY');
  const baseId = localStorage.getItem('VITE_AIRTABLE_BASE_ID');
  const cleanBaseId = baseId ? baseId.replace(/^https?:\/\/airtable\.com\//, '') : '';
  
  return { 
    apiKey, 
    baseId: cleanBaseId,
    isConfigured: Boolean(apiKey && baseId)
  };
};

// Helper function to make Airtable API requests
export const airtableFetch = async (tableId: string, method = 'GET', body?: any) => {
  const { apiKey, baseId, isConfigured } = getAirtableConfig();
  
  if (!isConfigured) {
    console.error('Airtable API key or base ID is not set in localStorage');
    throw new Error('Airtable configuration missing');
  }
  
  try {
    const url = `${AIRTABLE_API_URL}/${baseId}/${tableId}`;
    console.log(`Accessing Airtable: ${url} with method ${method}`);
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Airtable API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to ${method} data from Airtable:`, error);
    throw error;
  }
};

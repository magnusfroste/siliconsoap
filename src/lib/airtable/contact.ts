
import { ContactMessage } from '../types/airtable';
import { airtableFetch } from './utils';

export const sendContactMessage = async (contactData: ContactMessage): Promise<boolean> => {
  const tableId = 'Messages';
  
  console.log('Sending contact message to Airtable:', contactData);
  
  try {
    const body = {
      records: [
        {
          fields: {
            Name: contactData.name,
            Email: contactData.email,
            Message: contactData.message,
            Date: new Date().toISOString()
          }
        }
      ]
    };
    
    const data = await airtableFetch(tableId, 'POST', body);
    console.log('Airtable response:', data);
    return true;
  } catch (error) {
    console.error('Failed to send message to Airtable:', error);
    throw error;
  }
};


import { useQuery } from '@tanstack/react-query';
import { ExpertiseArea } from '../types/airtable';
import { airtableFetch } from './utils';

export const useExpertiseAreas = () => {
  const tableId = 'Expertise';
  
  return useQuery({
    queryKey: ['expertise'],
    queryFn: async (): Promise<ExpertiseArea[]> => {
      try {
        const data = await airtableFetch(tableId);
        console.log('Expertise data received:', data);
        
        return data.records.map((record: any) => {
          const fields = record.fields;
          return {
            id: record.id,
            title: fields.title || fields.Title || '',
            description: fields.description || fields.Description || '',
            icon: fields.icon || fields.Icon || 'Lightbulb',
          };
        });
      } catch (error) {
        console.error('Failed to fetch expertise areas from Airtable:', error);
        throw error;
      }
    },
    enabled: Boolean(localStorage.getItem('VITE_AIRTABLE_API_KEY') && localStorage.getItem('VITE_AIRTABLE_BASE_ID')),
  });
};

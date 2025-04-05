
import { useQuery } from '@tanstack/react-query';
import { FeaturedItem } from '../types/airtable';
import { airtableFetch } from './utils';

export const useFeaturedIn = () => {
  const tableId = 'FeaturedIn';
  
  return useQuery({
    queryKey: ['featuredIn'],
    queryFn: async (): Promise<FeaturedItem[]> => {
      try {
        const data = await airtableFetch(tableId);
        console.log('Featured In data received:', data);
        
        return data.records.map((record: any) => {
          const fields = record.fields;
          return {
            id: record.id,
            title: fields.title || fields.Title || '',
            description: fields.description || fields.Description || '',
            image: fields.image?.[0]?.url || 
                  (fields.Image && fields.Image[0] ? fields.Image[0].url : ''),
          };
        });
      } catch (error) {
        console.error('Failed to fetch featured items from Airtable:', error);
        throw error;
      }
    },
    enabled: Boolean(localStorage.getItem('VITE_AIRTABLE_API_KEY') && localStorage.getItem('VITE_AIRTABLE_BASE_ID')),
  });
};


import { useQuery } from '@tanstack/react-query';
import { HeroSection } from '../types/airtable';
import { airtableFetch } from './utils';

export const useHero = () => {
  const tableId = 'Hero';
  
  return useQuery({
    queryKey: ['hero'],
    queryFn: async (): Promise<HeroSection> => {
      try {
        const data = await airtableFetch(tableId);
        console.log('Hero data received:', data);
        
        const configName = localStorage.getItem('VITE_AIRTABLE_NAME') || '';
        
        if (data.records && data.records.length > 0) {
          const record = data.records[0];
          const fields = record.fields;
          
          return {
            id: record.id,
            name: fields.name || fields.Name || configName || 'Your Name',
            tagline: fields.tagline || fields.Tagline || 'Innovation Strategist • Product Visionary • AI Integration Expert',
            feature1: fields.feature1 || fields.Feature1 || 'Innovation',
            feature2: fields.feature2 || fields.Feature2 || 'Product Growth',
            feature3: fields.feature3 || fields.Feature3 || 'AI Value Creation',
            feature1Icon: fields.feature1Icon || fields.Feature1Icon || 'Rocket',
            feature2Icon: fields.feature2Icon || fields.Feature2Icon || 'BarChart',
            feature3Icon: fields.feature3Icon || fields.Feature3Icon || 'Brain',
          };
        } else {
          return {
            id: 'default',
            name: configName || 'Your Name',
            tagline: 'Innovation Strategist • Product Visionary • AI Integration Expert',
            feature1: 'Innovation',
            feature2: 'Product Growth',
            feature3: 'AI Value Creation',
            feature1Icon: 'Rocket',
            feature2Icon: 'BarChart',
            feature3Icon: 'Brain',
          };
        }
      } catch (error) {
        console.error('Failed to fetch hero data from Airtable:', error);
        throw error;
      }
    },
    enabled: Boolean(localStorage.getItem('VITE_AIRTABLE_API_KEY') && localStorage.getItem('VITE_AIRTABLE_BASE_ID')),
  });
};

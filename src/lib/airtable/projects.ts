
import { useQuery } from '@tanstack/react-query';
import { Project } from '../types/airtable';
import { airtableFetch } from './utils';

export const useProjects = () => {
  const tableId = localStorage.getItem('VITE_AIRTABLE_TABLE_ID') || 'Projects';
  
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      try {
        const data = await airtableFetch(tableId);
        console.log('Projects data received:', data);
        
        return data.records.map((record: any) => {
          const fields = record.fields;
          
          // Handle multiple images
          let mainImage = '';
          let imageArray: string[] = [];
          
          if (fields.image && fields.image.length > 0) {
            mainImage = fields.image[0].url;
            imageArray = fields.image.map((img: any) => img.url);
          } else if (fields.Image && fields.Image.length > 0) {
            mainImage = fields.Image[0].url;
            imageArray = fields.Image.map((img: any) => img.url);
          }
          
          return {
            id: record.id,
            title: fields.title || fields.Title || '',
            description: fields.description || fields.Description || '',
            image: mainImage,
            images: imageArray.length > 0 ? imageArray : undefined,
            demoLink: fields.demoLink || fields.DemoLink || fields.demolink || '',
            order: fields.order || fields.Order || null,
            problemStatement: fields.problemStatement || fields.ProblemStatement || 
                         fields.problem || fields.Problem || '',
            whyBuilt: fields.whyBuilt || fields.WhyBuilt || 
                  fields.reason || fields.Reason || fields.whyItMatters || fields.WhyItMatters || '',
          };
        });
      } catch (error) {
        console.error('Failed to fetch projects from Airtable:', error);
        throw error;
      }
    },
    enabled: Boolean(localStorage.getItem('VITE_AIRTABLE_API_KEY') && localStorage.getItem('VITE_AIRTABLE_BASE_ID')),
  });
};

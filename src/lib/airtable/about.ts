
import { useQuery } from '@tanstack/react-query';
import { AboutSection } from '../types/airtable';
import { airtableFetch } from './utils';

export const useAboutMe = () => {
  const tableId = 'AboutMe';
  
  return useQuery({
    queryKey: ['aboutMe'],
    queryFn: async (): Promise<AboutSection> => {
      try {
        const data = await airtableFetch(tableId);
        console.log('About Me data received:', data);
        
        const configName = localStorage.getItem('VITE_AIRTABLE_NAME') || '';
        
        if (data.records && data.records.length > 0) {
          const record = data.records[0];
          const fields = record.fields;
          
          return {
            id: record.id,
            name: fields.name || fields.Name || configName || 'Your Name',
            introText: fields.introText || fields.IntroText || '',
            additionalText: fields.additionalText || fields.AdditionalText || '',
            skill1Title: fields.skill1Title || fields.Skill1Title || 'Technology Leadership',
            skill1Description: fields.skill1Description || fields.Skill1Description || 'Proven track record as CTO leading teams and implementing cutting-edge technology solutions loved by customers.',
            skill1Icon: fields.skill1Icon || fields.Skill1Icon || 'Monitor',
            skill2Title: fields.skill2Title || fields.Skill2Title || 'Product Strategy & Business Development',
            skill2Description: fields.skill2Description || fields.Skill2Description || '20+ years of experience from innovating new product & services and product management, driving successful market launches across different sectors.',
            skill2Icon: fields.skill2Icon || fields.Skill2Icon || 'Rocket',
            skill3Title: fields.skill3Title || fields.Skill3Title || 'AI Innovation',
            skill3Description: fields.skill3Description || fields.Skill3Description || 'Generative AI specialist with a wide range of experience developing AI Agents, RAG solutions, local AI deployments, generative AI libraries/packages, and more.',
            skill3Icon: fields.skill3Icon || fields.Skill3Icon || 'Brain',
          };
        } else {
          return {
            id: 'default',
            name: configName || 'Your Name',
            introText: 'As a seasoned technology leader and innovator, I\'ve dedicated my career to helping organizations navigate the rapidly evolving tech landscape. My passion lies in identifying transformative opportunities at the intersection of business and technology.',
            additionalText: 'With extensive experience in business and product development, I excel at turning complex ideas into tangible solutions. My approach combines strategic thinking with hands-on technical expertise, ensuring that innovation translates directly into business value.',
            skill1Title: 'Technology Leadership',
            skill1Description: 'Proven track record as CTO leading teams and implementing cutting-edge technology solutions loved by customers.',
            skill1Icon: 'Monitor',
            skill2Title: 'Product Strategy & Business Development',
            skill2Description: '20+ years of experience from innovating new product & services and product management, driving successful market launches across different sectors.',
            skill2Icon: 'Rocket',
            skill3Title: 'AI Innovation',
            skill3Description: 'Generative AI specialist with a wide range of experience developing AI Agents, RAG solutions, local AI deployments, generative AI libraries/packages, and more.',
            skill3Icon: 'Brain',
          };
        }
      } catch (error) {
        console.error('Failed to fetch about me from Airtable:', error);
        throw error;
      }
    },
    enabled: Boolean(localStorage.getItem('VITE_AIRTABLE_API_KEY') && localStorage.getItem('VITE_AIRTABLE_BASE_ID')),
  });
};

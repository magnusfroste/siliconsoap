
import { StatisticsEntry } from '../types/airtable';
import { airtableFetch } from './utils';

/**
 * Log a page visit to Airtable
 */
export const logPageVisit = async (page: string): Promise<boolean> => {
  const tableId = 'Statistics';

  console.log(`Logging page visit for page: ${page}`);
  
  try {
    const statsData: StatisticsEntry = {
      type: 'page_visit',
      page,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };
    
    const body = {
      records: [
        {
          fields: {
            Type: statsData.type,
            Page: statsData.page,
            Project: statsData.project || '',
            Timestamp: statsData.timestamp,
            UserAgent: statsData.userAgent,
            Referrer: statsData.referrer
          }
        }
      ]
    };
    
    const data = await airtableFetch(tableId, 'POST', body);
    console.log('Airtable page visit log response:', data);
    return true;
  } catch (error) {
    console.error('Failed to log page visit to Airtable:', error);
    throw error;
  }
};

/**
 * Log a demo click to Airtable
 */
export const logDemoClick = async (projectTitle: string): Promise<boolean> => {
  const tableId = 'Statistics';

  console.log(`Logging demo click for project: ${projectTitle}`);
  
  try {
    const statsData: StatisticsEntry = {
      type: 'demo_click',
      project: projectTitle,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };
    
    const body = {
      records: [
        {
          fields: {
            Type: statsData.type,
            Page: statsData.page || 'portfolio',
            Project: statsData.project || '',
            Timestamp: statsData.timestamp,
            UserAgent: statsData.userAgent,
            Referrer: statsData.referrer
          }
        }
      ]
    };
    
    const data = await airtableFetch(tableId, 'POST', body);
    console.log('Airtable demo click log response:', data);
    return true;
  } catch (error) {
    console.error('Failed to log demo click to Airtable:', error);
    throw error;
  }
};

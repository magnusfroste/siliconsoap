
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import AboutMe from '@/components/AboutMe';
import FeaturedIn from '@/components/FeaturedIn';
import ExpertiseCards from '@/components/ExpertiseCards';
import ProjectShowcase from '@/components/ProjectShowcase';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { logPageVisit } from '@/lib/airtable';

// Hardcoded Airtable credentials - These are the actual values now
const AIRTABLE_API_KEY = "patlAzTOosbLUuINv.0d8bca81fe972e6d77b749d3d9674607f42fd408fa44debee1fcac7d458c7d9a";
const AIRTABLE_BASE_ID = "appaxa4LjdMvZt4Pv";
const AIRTABLE_TABLE_ID = "Projects";
const AIRTABLE_NAME = "John Doe";

const Index = () => {
  // Set hardcoded credentials
  useEffect(() => {
    // Set environment variables from hardcoded values
    localStorage.setItem('VITE_AIRTABLE_API_KEY', AIRTABLE_API_KEY);
    localStorage.setItem('VITE_AIRTABLE_BASE_ID', AIRTABLE_BASE_ID);
    localStorage.setItem('VITE_AIRTABLE_TABLE_ID', AIRTABLE_TABLE_ID);
    localStorage.setItem('VITE_AIRTABLE_NAME', AIRTABLE_NAME);
    
    // Also store in localStorage for persistence between page reloads
    localStorage.setItem('airtableApiKey', AIRTABLE_API_KEY);
    localStorage.setItem('airtableBaseId', AIRTABLE_BASE_ID);
    localStorage.setItem('airtableTableId', AIRTABLE_TABLE_ID);
    localStorage.setItem('airtableName', AIRTABLE_NAME);
    
    // Log homepage visit
    logPageVisit('homepage')
      .then(() => console.log('Homepage visit logged'))
      .catch(err => console.error('Failed to log homepage visit:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <AboutMe />
        <FeaturedIn />
        <ExpertiseCards />
        <ProjectShowcase />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

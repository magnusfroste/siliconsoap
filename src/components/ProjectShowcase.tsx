
import React, { useEffect, useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjects, Project, logPageVisit, logDemoClick } from '@/lib/airtable';
import { useNavigate } from 'react-router-dom';
import ProjectModal from './ProjectModal';

const fallbackProjects = [
  {
    id: '1',
    title: "PainPal - Your Child's Migraine Tracker! ✨",
    description: "Turn migraine tracking into an exciting adventure with PainPal - the first-ever headache diary app designed specifically for kids! Making Health Tracking Fun! Remember how challenging it used to be to get kids to track their headaches? Not anymore! PainPal transforms this important task into an engaging journey.",
    problemStatement: "Children with migraines often struggle to track their symptoms effectively, leading to difficulties in diagnosis and treatment. Traditional tracking methods are boring and not child-friendly.",
    whyBuilt: "I built PainPal to transform the tedious task of headache tracking into a fun adventure for kids. By making the process engaging through gamification, children are more likely to consistently track their symptoms, providing better data for healthcare providers and improving treatment outcomes.",
    image: "/lovable-uploads/feca8484-f150-45bc-ac93-4a2ac80adb7f.png",
    demoLink: "#demo-painpal",
    order: 1
  },
  {
    id: '2',
    title: "PenPal - Your AI Assisted Handwriting Coach",
    description: "Unlock Your Child's Potential with PenPal! Transform your child's handwriting journey into an exciting adventure while getting rewards! This cutting-edge app uses advanced AI to analyze your kid's handwriting, pinpointing exactly what they need to practice. No more struggles or frustration when coaching your kid, - just fun, engaging challenges that keep them motivated to improve!",
    problemStatement: "Many children struggle with handwriting, and parents often lack the tools and knowledge to help them improve effectively. Traditional practice methods can be tedious and demotivating.",
    whyBuilt: "I created PenPal to bridge the gap between AI technology and childhood education. By leveraging AI to analyze handwriting and provide personalized guidance, PenPal makes the learning process enjoyable and effective, reducing frustration for both children and parents.",
    image: "/lovable-uploads/2244a02e-2dae-45d0-a462-adcfe72a4045.png",
    demoLink: "#demo-penpal",
    order: 2
  },
  {
    id: '3',
    title: "AI Strategy Platform",
    description: "A comprehensive platform designed to help businesses integrate AI into their operations seamlessly. Featuring strategy roadmapping, implementation guides, and ROI calculators.",
    problemStatement: "Many businesses want to implement AI but struggle with creating effective strategies and measuring ROI. The lack of structured guidance often leads to failed AI initiatives and wasted resources.",
    whyBuilt: "I developed this platform to demystify AI implementation for businesses of all sizes. By providing clear roadmaps, practical guides, and accurate ROI calculators, companies can make informed decisions about AI integration that align with their specific goals and resources.",
    image: "/lovable-uploads/cac5ccde-8057-40e2-81d7-6b67c95f1e9a.png",
    demoLink: "#demo-ai-strategy",
    order: 3
  }
];

const ProjectShowcase = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const hasAirtableConfig = Boolean(
    localStorage.getItem('VITE_AIRTABLE_API_KEY') && 
    localStorage.getItem('VITE_AIRTABLE_BASE_ID')
  );
  
  const displayProjects: Project[] = projects && projects.length > 0 ? projects : fallbackProjects;
  
  const sortedProjects = [...displayProjects].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return 0;
  });
  
  const usingFallbackData = !projects || projects.length === 0;

  console.log('Projects from Airtable:', projects);
  console.log('Sorted projects:', sortedProjects);

  useEffect(() => {
    if (hasAirtableConfig) {
      logPageVisit('portfolio')
        .then(() => console.log('Portfolio visit logged'))
        .catch(err => console.error('Failed to log portfolio visit:', err));
    }
  }, [hasAirtableConfig]);

  const handleDemoClick = (projectTitle: string, demoLink: string) => {
    if (hasAirtableConfig) {
      logDemoClick(projectTitle)
        .then(() => console.log(`Click on "${projectTitle}" demo logged`))
        .catch(err => console.error(`Failed to log demo click for "${projectTitle}":`, err));
    }
    
    if (demoLink.startsWith('#')) {
      const element = document.querySelector(demoLink);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleViewMore = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  return (
    <section id="projects" className="py-20 bg-apple-light-gray">
      <div className="container mx-auto px-4">
        <h2 className="section-title">My Portfolio - Proof of Concepts & AI Initiatives</h2>
        
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-pulse text-center">
              <p className="text-gray-500">Loading projects from Airtable...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="glass-card p-4 mb-8 text-center">
            <p className="text-red-500">Could not load projects from Airtable. Using fallback data.</p>
            <p className="text-sm text-gray-500 mt-2">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <Button
              onClick={() => navigate('/airtable-config')}
              className="mt-4 apple-button"
            >
              Update Airtable Configuration
            </Button>
          </div>
        )}
        
        {!hasAirtableConfig && !error && !isLoading && (
          <div className="glass-card p-4 mb-8 text-center">
            <p className="text-amber-500">Using demo projects. Connect your Airtable to display your own projects.</p>
            <Button
              onClick={() => navigate('/airtable-config')}
              className="mt-4 apple-button"
            >
              Set Up Airtable Connection
            </Button>
          </div>
        )}
        
        {usingFallbackData && hasAirtableConfig && !error && !isLoading && (
          <div className="glass-card p-4 mb-8 text-center">
            <p className="text-amber-500">No projects found in Airtable or empty fields. Using fallback projects.</p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure your Airtable table has the correct structure with Title/title, Description/description, Image/image, DemoLink/demoLink, and Order/order fields.
            </p>
          </div>
        )}
        
        <div className="space-y-16">
          {sortedProjects.map((project, index) => {
            const isImageOnLeft = index % 2 === 0;
            
            return (
              <div 
                key={project.id} 
                className="glass-card overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                id={`demo-${project.title.toLowerCase().split(' ').slice(0, 2).join('-')}`}
                onClick={() => handleViewMore(project)}
              >
                <div className={`grid grid-cols-1 ${isImageOnLeft ? 'lg:grid-cols-[3fr,2fr]' : 'lg:grid-cols-[2fr,3fr]'}`}>
                  {isImageOnLeft ? (
                    <>
                      <div className="bg-gray-100 min-h-[300px] lg:min-h-[400px] overflow-hidden">
                        {project.image ? (
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image available
                          </div>
                        )}
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-semibold mb-4">{project.title}</h3>
                        <p className="text-gray-600 mb-6">{project.description}</p>
                        <div className="flex space-x-3">
                          <Button 
                            className="apple-button flex items-center gap-2" 
                            asChild
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the card click from triggering
                              if (project.demoLink.startsWith('#')) {
                                e.preventDefault();
                                handleDemoClick(project.title, project.demoLink);
                              } else {
                                handleDemoClick(project.title, project.demoLink);
                              }
                            }}
                          >
                            <a 
                              href={project.demoLink.startsWith('#') ? undefined : project.demoLink} 
                              target={project.demoLink.startsWith('#') ? undefined : "_blank"} 
                              rel={project.demoLink.startsWith('#') ? undefined : "noopener noreferrer"}
                            >
                              Demo
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation(); // This is redundant as the parent handler would be the same
                              handleViewMore(project);
                            }}
                          >
                            View More
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-semibold mb-4">{project.title}</h3>
                        <p className="text-gray-600 mb-6">{project.description}</p>
                        <div className="flex space-x-3">
                          <Button 
                            className="apple-button flex items-center gap-2" 
                            asChild
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the card click from triggering
                              if (project.demoLink.startsWith('#')) {
                                e.preventDefault();
                                handleDemoClick(project.title, project.demoLink);
                              } else {
                                handleDemoClick(project.title, project.demoLink);
                              }
                            }}
                          >
                            <a 
                              href={project.demoLink.startsWith('#') ? undefined : project.demoLink} 
                              target={project.demoLink.startsWith('#') ? undefined : "_blank"} 
                              rel={project.demoLink.startsWith('#') ? undefined : "noopener noreferrer"}
                            >
                              Demo
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation(); // This is redundant as the parent handler would be the same
                              handleViewMore(project);
                            }}
                          >
                            View More
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-100 min-h-[300px] lg:min-h-[400px] overflow-hidden">
                        {project.image ? (
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image available
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          isOpen={!!selectedProject}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

export default ProjectShowcase;

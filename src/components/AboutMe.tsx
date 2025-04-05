
import React from 'react';
import { Monitor, Rocket, Brain, Lightbulb, Building, LineChart, Layers, Users } from 'lucide-react';
import { useAboutMe } from '@/lib/airtable';
import { Skeleton } from '@/components/ui/skeleton';

// Map of icon names to components
const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="text-apple-purple h-5 w-5" />,
  Rocket: <Rocket className="text-apple-blue h-5 w-5" />,
  Brain: <Brain className="text-apple-purple h-5 w-5" />,
  Lightbulb: <Lightbulb className="text-apple-purple h-5 w-5" />,
  Building: <Building className="text-apple-blue h-5 w-5" />,
  LineChart: <LineChart className="text-apple-purple h-5 w-5" />,
  Layers: <Layers className="text-apple-blue h-5 w-5" />,
  Users: <Users className="text-apple-purple h-5 w-5" />
};

const AboutMe = () => {
  const { data: aboutMeData, isLoading, error } = useAboutMe();

  return (
    <section id="about" className="py-20 bg-white" aria-labelledby="about-heading">
      <div className="container mx-auto px-4">
        <h2 id="about-heading" className="section-title">About Me</h2>
        
        {isLoading ? (
          // Loading state
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                {aboutMeData?.introText || 'With over 20 years of experience in innovation strategy and product development, I help businesses integrate cutting-edge AI solutions to drive growth and efficiency.'}
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                {aboutMeData?.additionalText || 'My approach combines technical expertise with business acumen, ensuring that technological advancements translate directly into measurable business outcomes.'}
              </p>
            </div>
            
            <div className="space-y-6">
              <article className="glass-card p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-apple-light-purple flex items-center justify-center">
                  {iconMap[aboutMeData?.skill1Icon || 'Monitor']}
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">{aboutMeData?.skill1Title || 'AI Integration'}</h3>
                  <p className="text-gray-600">
                    {aboutMeData?.skill1Description || 'Specialized in integrating AI solutions that drive business value and enhance operational efficiency.'}
                  </p>
                </div>
              </article>
              
              <article className="glass-card p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-apple-light-blue flex items-center justify-center">
                  {iconMap[aboutMeData?.skill2Icon || 'Rocket']}
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">{aboutMeData?.skill2Title || 'Product Strategy'}</h3>
                  <p className="text-gray-600">
                    {aboutMeData?.skill2Description || 'Expert in product development with a focus on market fit and scalable growth strategies.'}
                  </p>
                </div>
              </article>
              
              <article className="glass-card p-6 flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-apple-light-purple flex items-center justify-center">
                  {iconMap[aboutMeData?.skill3Icon || 'Brain']}
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">{aboutMeData?.skill3Title || 'Innovation Leadership'}</h3>
                  <p className="text-gray-600">
                    {aboutMeData?.skill3Description || 'Guiding organizations through digital transformation with strategic innovation frameworks.'}
                  </p>
                </div>
              </article>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutMe;

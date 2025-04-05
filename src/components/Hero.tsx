
import React from 'react';
import { ChevronDown, Rocket, BarChart, Brain, Lightbulb, Building, LineChart, Layers, Users } from 'lucide-react';
import { useHero } from '@/lib/airtable';
import { Skeleton } from '@/components/ui/skeleton';

// Map of icon names to components
const iconMap: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="text-apple-purple h-5 w-5" />,
  BarChart: <BarChart className="text-apple-blue h-5 w-5" />,
  Brain: <Brain className="text-apple-purple h-5 w-5" />,
  Lightbulb: <Lightbulb className="text-apple-purple h-5 w-5" />,
  Building: <Building className="text-apple-blue h-5 w-5" />,
  LineChart: <LineChart className="text-apple-purple h-5 w-5" />,
  Layers: <Layers className="text-apple-blue h-5 w-5" />,
  Users: <Users className="text-apple-purple h-5 w-5" />
};

const Hero = () => {
  const { data: heroData, isLoading, error } = useHero();

  return (
    <section className="min-h-screen flex flex-col justify-center py-20 relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Background gradient circles */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-apple-light-purple rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-apple-light-blue rounded-full filter blur-3xl opacity-30"></div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {isLoading ? (
            // Loading state
            <>
              <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
              <Skeleton className="h-6 w-2/3 mx-auto mb-10" />
              <div className="flex justify-center gap-8 mb-16">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-12 w-12 rounded-full mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="h-12 w-12 rounded-full mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="h-12 w-12 rounded-full mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-apple-purple to-apple-blue bg-clip-text text-transparent mb-6 animate-fade-in-slow">
                {heroData?.name || 'Magnus Froste'}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-10 animate-fade-in">
                {heroData?.tagline || 'Innovation Strategist & AI Integration Expert'}
              </p>
              
              <div className="flex justify-center gap-8 mb-16 animate-fade-in">
                <div className="flex flex-col items-center" aria-label={heroData?.feature1 || 'Feature 1'}>
                  <div className="w-12 h-12 rounded-full bg-apple-light-purple flex items-center justify-center mb-2">
                    {iconMap[heroData?.feature1Icon || 'Rocket']}
                  </div>
                  <span className="text-gray-700">{heroData?.feature1 || 'Innovation'}</span>
                </div>
                
                <div className="flex flex-col items-center" aria-label={heroData?.feature2 || 'Feature 2'}>
                  <div className="w-12 h-12 rounded-full bg-apple-light-blue flex items-center justify-center mb-2">
                    {iconMap[heroData?.feature2Icon || 'BarChart']}
                  </div>
                  <span className="text-gray-700">{heroData?.feature2 || 'Strategy'}</span>
                </div>
                
                <div className="flex flex-col items-center" aria-label={heroData?.feature3 || 'Feature 3'}>
                  <div className="w-12 h-12 rounded-full bg-apple-light-purple flex items-center justify-center mb-2">
                    {iconMap[heroData?.feature3Icon || 'Brain']}
                  </div>
                  <span className="text-gray-700">{heroData?.feature3 || 'AI Integration'}</span>
                </div>
              </div>
            </>
          )}
          
          <a 
            href="#about"
            className="inline-flex items-center justify-center animate-bounce"
            aria-label="Scroll to About section"
          >
            <ChevronDown className="h-8 w-8 text-gray-400" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;

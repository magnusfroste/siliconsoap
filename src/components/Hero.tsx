
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useHero } from '@/lib/airtable';
import { Skeleton } from '@/components/ui/skeleton';
import AppleChat from './AppleChat';
import { Rocket, BarChart, Brain, Heart, Zap, Target } from 'lucide-react';

// Icon mapping for feature icons
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Rocket,
  BarChart,
  Brain,
  Heart,
  Zap,
  Target,
};

const Hero = () => {
  const { data: heroData, isLoading, error } = useHero();

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Rocket;
    return <IconComponent className="h-8 w-8 text-apple-blue" />;
  };

  return (
    <section className="min-h-screen flex flex-col justify-center py-20 relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Background gradient circles */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-apple-light-purple rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-apple-light-blue rounded-full filter blur-3xl opacity-30"></div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {isLoading ? (
            // Loading state
            <>
              <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
              <Skeleton className="h-6 w-2/3 mx-auto mb-10" />
            </>
          ) : (
            <>
              <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-apple-purple to-apple-blue bg-clip-text text-transparent mb-6 animate-fade-in-slow">
                {heroData?.name || 'Magnus Froste'}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-12 animate-fade-in">
                {heroData?.tagline || 'dare, care and simplify'}
              </p>

              {/* Features Section */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="flex flex-col items-center text-center p-6 bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-apple hover:shadow-apple-hover transition-shadow">
                  <div className="mb-4">
                    {getIcon(heroData?.feature1Icon || 'Rocket')}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {heroData?.feature1 || 'Innovation'}
                  </h3>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-apple hover:shadow-apple-hover transition-shadow">
                  <div className="mb-4">
                    {getIcon(heroData?.feature2Icon || 'Heart')}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {heroData?.feature2 || 'Product Growth'}
                  </h3>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-apple hover:shadow-apple-hover transition-shadow">
                  <div className="mb-4">
                    {getIcon(heroData?.feature3Icon || 'Zap')}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {heroData?.feature3 || 'AI Value Creation'}
                  </h3>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Apple Chat Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-apple-purple to-apple-blue bg-clip-text text-transparent mb-4">
              Chat with Magnet
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have a conversation with my AI-powered digital twin
            </p>
          </div>
          
          <AppleChat webhookUrl="https://agent.froste.eu/webhook/0780c81b-27df-4ac4-9f4c-824e47677ef3" />
        </div>

        {/* Scroll indicator */}
        <div className="text-center mt-16">
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

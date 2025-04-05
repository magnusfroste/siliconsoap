
import React from 'react';
import { Lightbulb, Building, LineChart, Rocket, Layers, Users } from 'lucide-react';
import { useExpertiseAreas } from '@/lib/airtable';
import { Skeleton } from '@/components/ui/skeleton';

// Map of icon names to components
const iconMap: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb className="h-6 w-6 text-apple-purple" />,
  Building: <Building className="h-6 w-6 text-apple-blue" />,
  LineChart: <LineChart className="h-6 w-6 text-apple-purple" />,
  Rocket: <Rocket className="h-6 w-6 text-apple-blue" />,
  Layers: <Layers className="h-6 w-6 text-apple-purple" />,
  Users: <Users className="h-6 w-6 text-apple-blue" />
};

// Fallback expertise areas (used if Airtable data fails to load)
const fallbackExpertiseAreas = [
  {
    id: '1',
    title: 'Innovation Leadership',
    description: "I'm driving technological advancement and cultural change in organizations, empowering curiosity and call to action.",
    icon: 'Lightbulb'
  },
  {
    id: '2',
    title: 'Business Development',
    description: "I can harness the power of unparalleled experience by actively listening to your customers, expertly identifying their pain points, and close deals with tailor-made solutions that not only meet but exceed their expectations.",
    icon: 'Building'
  },
  {
    id: '3',
    title: 'Product Strategy',
    description: "I can elevate your business with my 20+ years of expertise in product management and strategic market positioning. Achieve unmatched product-market fit and drive your sales to new heights.",
    icon: 'LineChart'
  },
  {
    id: '4',
    title: 'Startup Acceleration',
    description: "I'm mentoring and advising founders on rapid prototyping and go-to-market strategies, valuable for venture builders and new business.",
    icon: 'Rocket'
  },
  {
    id: '5',
    title: 'Product Development',
    description: "I leverage my expertise across diverse development journeys, from the exciting stealth start-up phase to managing complex projects in large enterprises, to drive your business success.",
    icon: 'Layers'
  },
  {
    id: '6',
    title: 'Customer Success',
    description: "I will help you enhance customer satisfaction by focusing on clients needs and providing exceptional value, enabling upselling as a complement to prospecting for new clients.",
    icon: 'Users'
  }
];

const ExpertiseCards = () => {
  const { data: expertiseAreas, isLoading, error } = useExpertiseAreas();

  // If there's an error or no data, use fallback data
  const areasToDisplay = error || !expertiseAreas?.length ? fallbackExpertiseAreas : expertiseAreas;
  
  // Log information for debugging
  console.log('Expertise areas:', { 
    isLoading, 
    error: error ? String(error) : null, 
    dataLength: expertiseAreas?.length, 
    usingFallback: error || !expertiseAreas?.length
  });

  return (
    <section id="expertise" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Areas of Expertise</h2>
        
        {isLoading ? (
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-6 h-full">
                <div className="flex items-start mb-4">
                  <Skeleton className="h-12 w-12 rounded-lg mr-4" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {areasToDisplay.map((area) => (
              <div key={area.id} className="glass-card p-6 h-full">
                <div className="flex items-start mb-4">
                  <div className="mr-4 p-3 bg-white rounded-lg shadow-sm">
                    {iconMap[area.icon] || <Lightbulb className="h-6 w-6 text-apple-purple" />}
                  </div>
                  <h3 className="text-xl font-semibold">{area.title}</h3>
                </div>
                <p className="text-gray-600">{area.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ExpertiseCards;

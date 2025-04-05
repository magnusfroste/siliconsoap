
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeaturedIn } from '@/lib/airtable';
import { Skeleton } from '@/components/ui/skeleton';

// Fallback featured items if Airtable data is not available
const fallbackItems = [
  {
    id: '1',
    image: '/lovable-uploads/28138354-db3a-4afd-ba4b-aa3f24fd056c.png',
    title: 'Innovation Panel',
    description: 'Expert panel on driving innovation in traditional industries'
  },
  {
    id: '2',
    image: '/lovable-uploads/76c280cc-900a-4d28-b7cc-e52a7f4793b7.png',
    title: 'Tech Conference',
    description: 'Keynote speaker at a leading technology conference'
  },
  {
    id: '3',
    image: '/lovable-uploads/19c8a77f-19ca-4427-ae8a-b07a6070c2c0.png',
    title: 'AI Symposium',
    description: 'Featured speaker discussing the future of AI in business'
  }
];

const FeaturedIn = () => {
  const { data: featuredItems, isLoading, error } = useFeaturedIn();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Use fallback items if no data from Airtable
  const displayItems = featuredItems && featuredItems.length > 0 ? featuredItems : fallbackItems;

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? displayItems.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === displayItems.length - 1 ? 0 : current + 1));
  };

  return (
    <section id="featured" className="py-20 bg-apple-light-gray">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-8">
          <Image className="h-8 w-8 text-apple-purple mr-3" />
          <h2 className="section-title mb-0">Featured In...</h2>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Carousel navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-gray-500 hover:text-apple-purple bg-white bg-opacity-60 rounded-full"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-gray-500 hover:text-apple-purple bg-white bg-opacity-60 rounded-full"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          {/* Carousel content */}
          {isLoading ? (
            <div className="glass-card p-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <Skeleton className="h-80 w-full rounded-xl" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="bg-gray-100 h-80 rounded-xl flex items-center justify-center overflow-hidden">
                  {displayItems[activeIndex].image ? (
                    <img 
                      src={displayItems[activeIndex].image} 
                      alt={displayItems[activeIndex].title}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Image className="h-12 w-12 mb-2" />
                      <span>Image not available</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold mb-4">{displayItems[activeIndex].title}</h3>
                  <p className="text-gray-600 mb-6">{displayItems[activeIndex].description}</p>
                  
                  <div className="flex justify-center space-x-2">
                    {displayItems.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          activeIndex === index ? 'bg-apple-purple' : 'bg-gray-300'
                        }`}
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedIn;

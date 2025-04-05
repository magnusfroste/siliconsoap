
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Project } from '@/lib/airtable';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal = ({ project, isOpen, onClose }: ProjectModalProps) => {
  const [current, setCurrent] = useState(0);
  
  // Determine if we have multiple images to display
  const hasMultipleImages = project.images && project.images.length > 1;
  const imagesToShow = project.images && project.images.length > 0
    ? project.images
    : project.image 
      ? [project.image] 
      : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Project Details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {imagesToShow.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              {hasMultipleImages ? (
                <div className="relative">
                  <Carousel
                    setApi={(api) => {
                      api?.on('select', () => {
                        setCurrent(api.selectedScrollSnap());
                      });
                    }}
                  >
                    <CarouselContent>
                      {imagesToShow.map((img, index) => (
                        <CarouselItem key={index}>
                          <div className="relative aspect-[16/9]">
                            <img 
                              src={img} 
                              alt={`${project.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="ml-2 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          const prevButton = document.querySelector('[data-carousel-prev]') as HTMLElement;
                          prevButton?.click();
                        }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                        <span className="sr-only">Previous slide</span>
                      </Button>
                      <Button 
                        variant="secondary"
                        size="icon"
                        className="mr-2 bg-black/30 hover:bg-black/50 text-white rounded-full w-10 h-10 pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextButton = document.querySelector('[data-carousel-next]') as HTMLElement;
                          nextButton?.click();
                        }}
                      >
                        <ChevronRight className="h-6 w-6" />
                        <span className="sr-only">Next slide</span>
                      </Button>
                    </div>
                    
                    <div className="hidden">
                      <CarouselPrevious data-carousel-prev />
                      <CarouselNext data-carousel-next />
                    </div>
                  </Carousel>
                  
                  {imagesToShow.length > 1 && (
                    <div className="mt-2 flex justify-center items-center gap-2">
                      <div className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">
                        {current + 1} / {imagesToShow.length}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <img 
                  src={imagesToShow[0]} 
                  alt={project.title}
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>
          
          {project.problemStatement && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Problem</h3>
              <p className="text-gray-600">{project.problemStatement}</p>
            </div>
          )}
          
          {project.whyBuilt && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Why It Matters</h3>
              <p className="text-gray-600">{project.whyBuilt}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;

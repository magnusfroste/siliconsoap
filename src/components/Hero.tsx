
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-[85vh] flex items-center py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-fade-in">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              Introducing
            </span>
            <h1 className="title text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Beautiful experiences with <span className="text-blue-500">confidence</span>
            </h1>
            <p className="subtitle text-lg md:text-xl text-muted-foreground">
              Create stunning interfaces with our modern single page application. 
              Fast, responsive, and beautifully designed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="text-md px-6 py-6 bg-blue-500 hover:bg-blue-600">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="text-md px-6 py-6">
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-blue bg-gradient-to-br from-blue-500 to-blue-700 p-8 flex items-center justify-center">
              <div className="text-white text-2xl md:text-3xl font-bold text-center">
                Discover the Experience
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-100 rounded-full -z-10"></div>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-200 rounded-full -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

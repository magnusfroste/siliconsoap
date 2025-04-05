
import { CheckCircle, Layout, Shield, Zap } from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-blue hover:shadow-lg transition-shadow duration-300">
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Zap size={24} />,
      title: "Lightning Fast",
      description: "Optimized performance ensures your users get the best experience possible."
    },
    {
      icon: <Layout size={24} />,
      title: "Responsive Design",
      description: "Looks great on any device, from mobile phones to desktop computers."
    },
    {
      icon: <Shield size={24} />,
      title: "Secure By Default",
      description: "Built with modern security practices to protect you and your users."
    },
    {
      icon: <CheckCircle size={24} />,
      title: "Easy to Customize",
      description: "Simple to modify and extend to match your brand and specific needs."
    }
  ];

  return (
    <section id="features" className="section bg-secondary/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="title">What We Offer</h2>
          <p className="subtitle mx-auto">Our single page application comes packed with everything you need to create amazing web experiences.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="animate-fade-in-up" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Feature {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  avatar: string;
}

const Testimonial = ({ content, author, role, avatar }: TestimonialProps) => {
  return (
    <Card className="bg-white border-none shadow-blue h-full">
      <CardContent className="p-6">
        <div className="flex mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className="fill-blue-500 text-blue-500" />
          ))}
        </div>
        <p className="text-gray-700 mb-6">{content}</p>
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={avatar} alt={author} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{author}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      content: "This is exactly what our team has been looking for. The simplicity and elegance of the design made implementation a breeze.",
      author: "Alex Johnson",
      role: "Product Manager",
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      content: "I've worked with many similar tools, but nothing comes close to the performance and ease of use I found here.",
      author: "Sarah Williams",
      role: "UX Designer",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      content: "The responsiveness of the application is impressive. Our mobile users have seen a significant improvement in their experience.",
      author: "Michael Chen",
      role: "CTO",
      avatar: "https://i.pravatar.cc/150?img=8"
    }
  ];

  return (
    <section className="section">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="title">What People Say</h2>
          <p className="subtitle mx-auto">Don't just take our word for it. Here's what our users have to say.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="animate-fade-in-up" 
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Testimonial {...testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

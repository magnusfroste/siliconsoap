
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold">SingleApp</h3>
            <p className="text-muted-foreground mt-2">Beautiful experiences with confidence</p>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SingleApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import React from 'react';
import { Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-apple-light-gray py-10 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <p className="text-gray-600">© {new Date().getFullYear()} Magnus Froste. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-6">
            <a 
              href="https://github.com/magnusfroste" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-apple-purple transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://linkedin.com/magnusfroste" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-apple-purple transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com/magnusfroste" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-apple-purple transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

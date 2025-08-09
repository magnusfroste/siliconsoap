
import React, { useState, useEffect } from 'react';
import { Menu, X, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to stop any ongoing speech synthesis when navigating
  const stopSpeech = () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div>
            <Link to="/" className="text-2xl font-semibold bg-gradient-to-r from-apple-purple to-apple-blue bg-clip-text text-transparent">
              froste.eu
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-10 items-center">
            {!isHomePage && (
              <Link 
                to="/" 
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full font-medium transition-all hover:bg-purple-200"
                onClick={stopSpeech}
              >
                <Home size={18} />
                Labs Home
              </Link>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 focus:outline-none" 
            onClick={toggleMenu}
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden py-4 pb-6 space-y-4 flex flex-col items-center">
            {!isHomePage && (
              <Link 
                to="/" 
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full font-medium"
                onClick={() => {
                  stopSpeech();
                  toggleMenu();
                }}
              >
                <Home size={18} />
                Labs Home
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

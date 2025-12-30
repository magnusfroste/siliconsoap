import React from 'react';
import { Github, Linkedin, Twitter, Globe, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-muted/50 py-10 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">SiliconSoap</h3>
            <p className="text-sm text-muted-foreground">Where AI Debates Get Dramatic</p>
          </div>

          {/* Founder */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-2">Created by</p>
            <p className="font-medium text-foreground mb-3">Magnus Froste</p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://github.com/magnusfroste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://froste.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Website"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/froste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/magnusfroste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground mb-2">Explore</p>
            <div className="flex flex-col space-y-1">
              <Link to="/labs/agents-meetup/learn" className="text-sm text-foreground hover:text-primary transition-colors">
                Learn about AI Models
              </Link>
              <Link to="/labs/agents-meetup/learn?tab=about" className="text-sm text-foreground hover:text-primary transition-colors">
                About SiliconSoap
              </Link>
              <Link to="/labs/agents-meetup" className="text-sm text-foreground hover:text-primary transition-colors">
                Start a Debate
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SiliconSoap. All rights reserved.
          </p>
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            Models powered by OpenRouter
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

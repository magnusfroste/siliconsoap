import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Atom, ArrowRight, Sparkles, Brain, Network } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'live' | 'coming-soon' | 'beta';
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  tags: string[];
  features: string[];
}

const projects: Project[] = [
  {
    id: 'agents-meetup',
    title: 'AI Agents Meetup',
    description: 'Watch AI agents from leading LLM providers collaborate with different personas to solve complex problems through multi-agent conversations.',
    status: 'live',
    icon: Atom,
    path: '/labs/agents-meetup',
    tags: ['Multi-Agent', 'OpenRouter', 'Conversation'],
    features: [
      'Multiple AI models from different providers',
      'Customizable agent personas',
      'Real-time conversation analysis',
      'Token usage tracking'
    ]
  },
  {
    id: 'agent-workflow',
    title: 'Agent Workflow Builder',
    description: 'Create complex AI workflows by chaining agents together in visual flowcharts with conditional logic and parallel processing.',
    status: 'coming-soon',
    icon: Network,
    path: '/labs/workflow-builder',
    tags: ['Workflow', 'Visual Builder', 'Automation'],
    features: [
      'Drag & drop workflow designer',
      'Conditional branching',
      'Parallel agent execution',
      'Integration with external APIs'
    ]
  },
  {
    id: 'smart-researcher',
    title: 'AI Research Assistant',
    description: 'An intelligent research assistant that can analyze documents, search the web, and synthesize information from multiple sources.',
    status: 'coming-soon',
    icon: Brain,
    path: '/labs/research-assistant',
    tags: ['Research', 'RAG', 'Web Search'],
    features: [
      'Multi-source information gathering',
      'Document analysis and summarization',
      'Citation tracking',
      'Export to various formats'
    ]
  }
];

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'live':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'beta':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'coming-soon':
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
};

const getStatusText = (status: Project['status']) => {
  switch (status) {
    case 'live':
      return 'Live';
    case 'beta':
      return 'Beta';
    case 'coming-soon':
      return 'Coming Soon';
  }
};

const LabsLanding: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-6">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AI Labs
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-8">
              Explore cutting-edge AI agent technologies and agentic workflows. 
              Build, experiment, and discover the future of artificial intelligence collaboration.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {projects.filter(p => p.status === 'live').length} Live Projects
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                {projects.filter(p => p.status === 'coming-soon').length} Coming Soon
              </span>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {projects.map((project) => {
              const IconComponent = project.icon;
              const isAvailable = project.status === 'live' || project.status === 'beta';
              
              return (
                <Card key={project.id} className="group relative overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(project.status)}
                      >
                        {getStatusText(project.status)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Key Features:</h4>
                      <ul className="space-y-1">
                        {project.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      {isAvailable ? (
                        <Button asChild className="w-full group">
                          <Link to={project.path}>
                            Try It Out
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Building the Future of AI</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              These projects showcase the potential of multi-agent systems and advanced AI workflows. 
              Each tool is designed to push the boundaries of what's possible with AI collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/labs/agents-meetup">
                  Start with AI Agents Meetup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabsLanding;
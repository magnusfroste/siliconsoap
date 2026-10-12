import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/editorial/Brand';
import { PageHeader } from '@/components/editorial/PageHeader';
const NotFound = () => {
 const location=useLocation();
 useEffect(()=>{console.error('404 Error: User attempted to access non-existent route:',location.pathname);},[location.pathname]);
 return <main className="min-h-screen bg-background px-4 py-10"><div className="mx-auto max-w-4xl"><Link to="/" className="inline-flex min-h-11 mb-20"><Brand/></Link><PageHeader eyebrow="404 · Page not found" title="This page isn't part of the debate." lead="The conversation continues elsewhere."/><div className="flex flex-wrap gap-3"><Button asChild className="min-h-11"><Link to="/new">Start a debate</Link></Button><Button asChild variant="outline" className="min-h-11"><Link to="/explore">Explore</Link></Button><Button asChild variant="outline" className="min-h-11"><Link to="/models">Models</Link></Button></div></div></main>;
};
export default NotFound;

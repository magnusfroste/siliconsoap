import { PageHeader } from '@/components/editorial/PageHeader';
import { Shield, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AdminHeader = () => {
  return <PageHeader eyebrow="Administration" title="Admin Panel" lead="Manage feature flags and system settings." action={<Button variant="outline" className="min-h-11" asChild><Link to="/status"><Activity className="h-4 w-4 mr-2"/>Model Status</Link></Button>} />;
};

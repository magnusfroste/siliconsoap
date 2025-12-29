import { Shield, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AdminHeader = () => {
  return (
    <div className="flex items-center justify-between pb-2">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage feature flags and system settings</p>
        </div>
      </div>
      <Button variant="outline" asChild>
        <Link to="/status">
          <Activity className="h-4 w-4 mr-2" />
          Model Status
        </Link>
      </Button>
    </div>
  );
};

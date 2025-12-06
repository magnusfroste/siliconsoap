import { Shield } from 'lucide-react';

export const AdminHeader = () => {
  return (
    <div className="flex items-center gap-3 pb-2">
      <Shield className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage feature flags and system settings</p>
      </div>
    </div>
  );
};

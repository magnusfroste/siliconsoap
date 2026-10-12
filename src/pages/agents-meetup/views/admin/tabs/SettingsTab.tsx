import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { settingsService } from '@/services';
import {
  SIDEBAR_NAV_ITEMS,
  resolveNavOrder,
  serializeNavOrder,
  type NavItem,
} from '@/services/navOrderService';

export const SettingsTab = () => {
  const { getTextValue } = useFeatureFlags();
  const [navOrder, setNavOrder] = useState<NavItem[]>(SIDEBAR_NAV_ITEMS);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setNavOrder(resolveNavOrder(getTextValue('sidebar_nav_order')));
  }, [getTextValue]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...navOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setNavOrder(newOrder);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.saveNavOrder(serializeNavOrder(navOrder));
      setHasChanges(false);
      toast.success('Sidebar order saved');
    } catch (error) {
      console.error('Error saving sidebar order:', error);
      toast.error('Failed to save sidebar order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sidebar Navigation Order</CardTitle>
          <CardDescription>
            Drag or use arrows to reorder navigation items in the sidebar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {navOrder.map((item, index) => (
            <div
              key={item.key}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground font-mono">{item.key}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === navOrder.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Order'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

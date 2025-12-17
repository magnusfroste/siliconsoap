import { supabase } from '@/integrations/supabase/client';

export const settingsService = {
  async saveNavOrder(orderString: string): Promise<void> {
    // Check if the flag exists
    const { data: existing } = await supabase
      .from('feature_flags')
      .select('id')
      .eq('key', 'sidebar_nav_order')
      .single();

    if (existing) {
      const { error } = await supabase
        .from('feature_flags')
        .update({ text_value: orderString })
        .eq('key', 'sidebar_nav_order');
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('feature_flags')
        .insert({
          key: 'sidebar_nav_order',
          name: 'Sidebar Navigation Order',
          description: 'Order of navigation items in the sidebar',
          enabled: true,
          text_value: orderString,
        });
      
      if (error) throw error;
    }
  }
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type SectionToggle = Tables<'section_toggles'>;
type SectionToggleInsert = TablesInsert<'section_toggles'>;

export const useSectionToggles = () => {
  const [toggles, setToggles] = useState<SectionToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { toast } = useToast();

  const fetchToggles = async () => {
    try {
      console.log('Fetching section toggles...');
      setLoading(true);
      setDataLoaded(false);
      
      const { data, error } = await supabase
        .from('section_toggles')
        .select('*')
        .order('section_name');

      if (error) {
        console.error('Error fetching toggles:', error);
        throw error;
      }
      
      console.log('Fetched toggles:', data);
      setToggles(data || []);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching section toggles:', error);

      // Fallback to demo data
      const demoToggles = [
        {
          id: 'demo-toggle-1',
          section_name: 'facilitators',
          is_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-toggle-2',
          section_name: 'resources',
          is_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-toggle-3',
          section_name: 'achievements',
          is_enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setToggles(demoToggles as any);
      setDataLoaded(true);

      toast({
        title: "Demo Mode",
        description: "Using demo data for section toggles"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateToggle = async (sectionName: string, isEnabled: boolean) => {
    try {
      console.log(`Updating ${sectionName} to ${isEnabled}`);
      
      const { data, error } = await supabase
        .from('section_toggles')
        .update({ 
          is_enabled: isEnabled, 
          updated_at: new Date().toISOString() 
        })
        .eq('section_name', sectionName)
        .select();

      if (error) {
        console.error('Error updating toggle:', error);
        throw error;
      }

      console.log('Update successful:', data);

      // Update local state immediately
      setToggles(prev => prev.map(toggle => 
        toggle.section_name === sectionName 
          ? { ...toggle, is_enabled: isEnabled, updated_at: new Date().toISOString() }
          : toggle
      ));

      console.log(`Successfully updated ${sectionName} to ${isEnabled}`);
      toast({
        title: "Success",
        description: `${sectionName} section ${isEnabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.error('Error updating section toggle:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update section toggle"
      });
      // Revert local state on error by refetching
      await fetchToggles();
    }
  };

  const getToggleStatus = (sectionName: string) => {
    // If data hasn't loaded yet, return null to prevent premature rendering
    if (!dataLoaded) {
      console.log(`Data not loaded yet for ${sectionName}, returning null`);
      return null;
    }
    
    const toggle = toggles.find(t => t.section_name === sectionName);
    
    if (!toggle) {
      console.log(`No toggle found for ${sectionName}, returning false (disabled by default)`);
      return false;
    }
    
    const status = toggle.is_enabled;
    console.log(`Toggle status for ${sectionName}:`, status, 'from toggle:', toggle);
    return status;
  };

  useEffect(() => {
    fetchToggles();
  }, []);

  return {
    toggles,
    loading,
    dataLoaded,
    updateToggle,
    getToggleStatus,
    refetch: fetchToggles
  };
};

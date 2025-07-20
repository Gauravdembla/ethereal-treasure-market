
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Resource = Tables<'resources'>;
type ResourceInsert = TablesInsert<'resources'>;

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);

      // Fallback to demo data
      const demoResources = [
        {
          id: 'demo-res-1',
          title: 'Mindfulness Guide',
          description: 'Complete guide to mindfulness practices for beginners',
          type: 'PDF' as const,
          category: 'guides' as const,
          url: 'https://example.com/mindfulness-guide.pdf',
          file_size: '2.5 MB',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-res-2',
          title: 'Meditation Video Series',
          description: '10-part video series on meditation techniques',
          type: 'Video' as const,
          category: 'videos' as const,
          url: 'https://example.com/meditation-series',
          file_size: '500 MB',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setResources(demoResources as any);

      toast({
        title: "Demo Mode",
        description: "Using demo data for resources"
      });
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resourceData: Omit<ResourceInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          ...resourceData,
          uploaded_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setResources(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Resource added successfully"
      });
      return data;
    } catch (error) {
      console.error('Error adding resource:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add resource"
      });
      throw error;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setResources(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resource"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    resources,
    loading,
    addResource,
    deleteResource,
    refetch: fetchResources
  };
};

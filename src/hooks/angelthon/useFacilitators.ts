
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Facilitator = Tables<'facilitators'>;
type FacilitatorInsert = TablesInsert<'facilitators'>;

export const useFacilitators = () => {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFacilitators = async () => {
    try {
      const { data, error } = await supabase
        .from('facilitators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFacilitators(data || []);
    } catch (error) {
      console.error('Error fetching facilitators:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch facilitators"
      });
    } finally {
      setLoading(false);
    }
  };

  const addFacilitator = async (facilitatorData: Omit<FacilitatorInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('facilitators')
        .insert([facilitatorData])
        .select()
        .single();

      if (error) throw error;
      
      setFacilitators(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Facilitator added successfully"
      });
      return data;
    } catch (error) {
      console.error('Error adding facilitator:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add facilitator"
      });
      throw error;
    }
  };

  const updateFacilitator = async (id: string, updates: Partial<FacilitatorInsert>) => {
    try {
      const { data, error } = await supabase
        .from('facilitators')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setFacilitators(prev => prev.map(f => f.id === id ? data : f));
      }
      toast({
        title: "Success",
        description: "Facilitator updated successfully"
      });
      return data;
    } catch (error) {
      console.error('Error updating facilitator:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update facilitator"
      });
      throw error;
    }
  };

  const deleteFacilitator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('facilitators')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFacilitators(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Success",
        description: "Facilitator deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting facilitator:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete facilitator"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchFacilitators();
  }, []);

  return {
    facilitators,
    loading,
    addFacilitator,
    updateFacilitator,
    deleteFacilitator,
    refetch: fetchFacilitators
  };
};

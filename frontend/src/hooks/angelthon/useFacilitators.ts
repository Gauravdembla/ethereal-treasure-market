
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
      console.log('🔍 Fetching facilitators from Supabase...');

      const { data, error } = await supabase
        .from('facilitators')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Successfully fetched facilitators:', data?.length || 0, 'records');
      console.log('📋 Facilitators data:', data?.map(f => ({ id: f.id, name: f.name, is_visible: f.is_visible, sort_order: f.sort_order })));

      setFacilitators(data || []);

      if (data && data.length > 0) {
        toast({
          title: "✅ Data Loaded",
          description: `Loaded ${data.length} facilitators from database`
        });
      }

    } catch (error: any) {
      console.error('❌ Error fetching facilitators:', error);

      // Check if it's a permission/auth error
      const isAuthError = error?.message?.includes('permission') ||
                         error?.message?.includes('RLS') ||
                         error?.message?.includes('policy') ||
                         error?.code === 'PGRST301';

      if (isAuthError) {
        console.log('🔐 Auth/Permission error detected, using demo data');

        // Fallback to demo data for auth issues
        const demoFacilitators = [
          {
            id: 'demo-1',
            name: 'Dr. Sarah Johnson (Demo)',
            role: 'Lead Facilitator',
            bio: 'Demo data - Experienced transformation coach with 10+ years in mindfulness and personal development.',
            email: 'sarah@angelthon.com',
            phone: '+1234567890',
            expertise: ['Mindfulness', 'Leadership', 'Personal Growth'],
            image: '/placeholder.svg',
            is_visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-2',
            name: 'Michael Chen (Demo)',
            role: 'Senior Facilitator',
            bio: 'Demo data - Expert in organizational psychology and team dynamics with a focus on innovative methodologies.',
            email: 'michael@angelthon.com',
            phone: '+1234567891',
            expertise: ['Team Building', 'Psychology', 'Innovation'],
            image: '/placeholder.svg',
            is_visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        setFacilitators(demoFacilitators as any);

        toast({
          title: "🔐 Demo Mode",
          description: "Using demo data due to permission restrictions"
        });
      } else {
        // For other errors, show the actual error
        toast({
          variant: "destructive",
          title: "❌ Error Loading Facilitators",
          description: error?.message || "Failed to fetch facilitators from database"
        });
        setFacilitators([]);
      }
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

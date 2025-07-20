
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Role = Tables<'roles'>;
type RoleInsert = TablesInsert<'roles'>;

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch roles"
      });
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (roleData: Omit<RoleInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert([roleData])
        .select()
        .single();

      if (error) throw error;
      
      setRoles(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Role created successfully"
      });
      return data;
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create role"
      });
      throw error;
    }
  };

  const updateRole = async (id: string, updates: Partial<RoleInsert>) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRoles(prev => prev.map(role => role.id === id ? data : role));
      toast({
        title: "Success",
        description: "Role updated successfully"
      });
      return data;
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update role"
      });
      throw error;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRoles(prev => prev.filter(role => role.id !== id));
      toast({
        title: "Success",
        description: "Role deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete role"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    addRole,
    updateRole,
    deleteRole,
    refetch: fetchRoles
  };
};

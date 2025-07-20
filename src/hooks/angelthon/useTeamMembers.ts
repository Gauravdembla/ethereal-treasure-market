
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type TeamMember = Tables<'team_members'>;
type TeamMemberInsert = TablesInsert<'team_members'>;

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          roles!inner(name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch team members"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = async (memberData: Omit<TeamMemberInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          ...memberData,
          invited_by: user?.id
        }])
        .select(`
          *,
          roles!inner(name, description)
        `)
        .single();

      if (error) throw error;
      
      setTeamMembers(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Team member added successfully"
      });
      return data;
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add team member"
      });
      throw error;
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMemberInsert>) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          roles!inner(name, description)
        `)
        .single();

      if (error) throw error;
      
      setTeamMembers(prev => prev.map(member => member.id === id ? data : member));
      toast({
        title: "Success",
        description: "Team member updated successfully"
      });
      return data;
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update team member"
      });
      throw error;
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTeamMembers(prev => prev.filter(member => member.id !== id));
      toast({
        title: "Success",
        description: "Team member removed successfully"
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    teamMembers,
    loading,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    refetch: fetchTeamMembers
  };
};

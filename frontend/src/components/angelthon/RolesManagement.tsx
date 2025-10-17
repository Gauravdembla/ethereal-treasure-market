
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRoles } from "@/hooks/angelthon/useRoles";
import { UserCog, Plus, Edit, Trash2, Shield } from "lucide-react";

const RolesManagement = () => {
  const { roles, loading, addRole, updateRole, deleteRole } = useRoles();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: {
      all: false,
      manage_users: false,
      manage_content: false,
      manage_facilitators: false,
      manage_resources: false,
      manage_achievements: false,
      view_content: false
    }
  });

  const handleAddRole = async () => {
    if (!newRole.name) return;

    try {
      await addRole({
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions
      });

      setNewRole({
        name: '',
        description: '',
        permissions: {
          all: false,
          manage_users: false,
          manage_content: false,
          manage_facilitators: false,
          manage_resources: false,
          manage_achievements: false,
          view_content: false
        }
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleEditRole = async () => {
    if (!editingRole) return;

    try {
      await updateRole(editingRole.id, {
        name: editingRole.name,
        description: editingRole.description,
        permissions: editingRole.permissions
      });

      setEditingRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (id: string, roleName: string) => {
    if (['admin', 'moderator', 'user'].includes(roleName.toLowerCase())) {
      alert('Cannot delete default system roles');
      return;
    }

    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id);
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const updatePermission = (permissions: any, key: string, value: boolean, isEditing = false) => {
    const updated = { ...permissions, [key]: value };
    
    if (isEditing && editingRole) {
      setEditingRole({ ...editingRole, permissions: updated });
    } else {
      setNewRole({ ...newRole, permissions: updated });
    }
  };

  const getPermissionLabels = () => [
    { key: 'all', label: 'Full Access', description: 'Complete system access' },
    { key: 'manage_users', label: 'Manage Users', description: 'Add, edit, delete users' },
    { key: 'manage_content', label: 'Manage Content', description: 'Create and edit content' },
    { key: 'manage_facilitators', label: 'Manage Facilitators', description: 'Add, edit facilitators' },
    { key: 'manage_resources', label: 'Manage Resources', description: 'Upload and manage resources' },
    { key: 'manage_achievements', label: 'Manage Achievements', description: 'Create achievements and badges' },
    { key: 'view_content', label: 'View Content', description: 'Read-only access to content' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Roles Management</h2>
          <p className="text-gray-600">Define roles and permissions for team members</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description"
                  />
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="space-y-3 mt-2">
                  {getPermissionLabels().map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{perm.label}</div>
                        <div className="text-sm text-gray-500">{perm.description}</div>
                      </div>
                      <Switch
                        checked={newRole.permissions[perm.key as keyof typeof newRole.permissions]}
                        onCheckedChange={(checked) => updatePermission(newRole.permissions, perm.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleAddRole} className="w-full">
                Create Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Shield className="h-5 w-5 mt-1 text-purple-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{role.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.permissions as any).map(([key, value]) => (
                        value && (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        )
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingRole(role)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {!['admin', 'moderator', 'user'].includes(role.name.toLowerCase()) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteRole(role.id, role.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      {editingRole && (
        <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Role Name</Label>
                  <Input
                    id="edit-name"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole(prev => ({ ...prev, name: e.target.value }))}
                    disabled={['admin', 'moderator', 'user'].includes(editingRole.name.toLowerCase())}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingRole.description || ''}
                    onChange={(e) => setEditingRole(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="space-y-3 mt-2">
                  {getPermissionLabels().map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{perm.label}</div>
                        <div className="text-sm text-gray-500">{perm.description}</div>
                      </div>
                      <Switch
                        checked={editingRole.permissions[perm.key] || false}
                        onCheckedChange={(checked) => updatePermission(editingRole.permissions, perm.key, checked, true)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleEditRole} className="w-full">
                Update Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RolesManagement;

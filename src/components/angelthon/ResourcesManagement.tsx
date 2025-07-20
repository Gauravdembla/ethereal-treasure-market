
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useResources } from "@/hooks/angelthon/useResources";
import { useSectionToggles } from "@/hooks/angelthon/useSectionToggles";
import { Plus, FileText, Video, Link as LinkIcon, Edit, Trash2, Settings } from "lucide-react";

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'PDF' | 'Video' | 'Link' | 'Tool';
  url: string;
  category: 'guides' | 'videos' | 'tools';
  uploadedAt: string;
  size?: string;
}

const ResourcesManagement = () => {
  const { resources, loading, addResource, deleteResource } = useResources();
  const { getToggleStatus, updateToggle } = useSectionToggles();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'PDF' as Resource['type'],
    category: 'guides' as Resource['category'],
    url: ''
  });

  const resourcesSectionEnabled = getToggleStatus('resources');

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.description) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    try {
      await addResource({
        title: newResource.title,
        description: newResource.description,
        type: newResource.type,
        category: newResource.category,
        url: newResource.url || "#"
      });

      setNewResource({
        title: '',
        description: '',
        type: 'PDF',
        category: 'guides',
        url: ''
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const getTypeColor = (type: Resource['type']) => {
    switch (type) {
      case 'PDF': return 'bg-blue-100 text-blue-800';
      case 'Video': return 'bg-red-100 text-red-800';
      case 'Tool': return 'bg-green-100 text-green-800';
      case 'Link': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'PDF': return FileText;
      case 'Video': return Video;
      case 'Tool': return LinkIcon;
      case 'Link': return LinkIcon;
      default: return FileText;
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resources Management</h2>
          <p className="text-gray-600">Manage guides, videos, and tools for the platform</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Section Enabled:</span>
            <Switch
              checked={resourcesSectionEnabled}
              onCheckedChange={(checked) => updateToggle('resources', checked)}
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter resource title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newResource.description}
                    onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter resource description"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="Enter resource URL"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newResource.type}
                      onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as Resource['type'] }))}
                    >
                      <option value="PDF">PDF</option>
                      <option value="Video">Video</option>
                      <option value="Tool">Tool</option>
                      <option value="Link">Link</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newResource.category}
                      onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value as Resource['category'] }))}
                    >
                      <option value="guides">Guides</option>
                      <option value="videos">Videos</option>
                      <option value="tools">Tools</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleAddResource} className="w-full">
                  Add Resource
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {resources.map((resource) => {
          const Icon = getTypeIcon(resource.type);
          return (
            <Card key={resource.id} className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon className="h-5 w-5 mt-1 text-gray-500" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(resource.type)}>
                          {resource.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {resource.category} • {new Date(resource.created_at).toLocaleDateString()}
                        </span>
                        {resource.file_size && (
                          <span className="text-xs text-gray-500">• {resource.file_size}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {resources.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No resources added yet. Click "Add Resource" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesManagement;

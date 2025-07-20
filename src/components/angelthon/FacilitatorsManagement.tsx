import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useFacilitators } from "@/hooks/angelthon/useFacilitators";
import { useSectionToggles } from "@/hooks/angelthon/useSectionToggles";
import { UserPlus, Edit, Trash2, User, Award, Eye, EyeOff, Settings, Plus, X, Heart } from "lucide-react";

const FacilitatorPreview = ({ facilitatorData }: { facilitatorData: any }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Profile Image */}
        <div className="relative">
          <img
            src={facilitatorData.image || '/placeholder.svg'}
            alt={facilitatorData.name || 'Preview'}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>

        {/* Name and Role */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {facilitatorData.name || 'Facilitator Name'}
          </h3>
          <p className="text-purple-600 font-medium text-sm">
            {facilitatorData.role || 'Role/Title'}
          </p>
        </div>

        {/* Membership Level and Lives Impacted */}
        <div className="space-y-2">
          {facilitatorData.membership_level && (
            <div className="flex items-center justify-center space-x-2">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-semibold text-purple-600">
                {facilitatorData.membership_level}
              </span>
            </div>
          )}
          
          {facilitatorData.lives_impacted && facilitatorData.lives_impacted > 0 && (
            <div className="flex items-center justify-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-gray-700">
                {facilitatorData.lives_impacted.toLocaleString()} Lives Impacted
              </span>
            </div>
          )}
        </div>

        {/* Badge Images */}
        {facilitatorData.badge_urls && facilitatorData.badge_urls.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {facilitatorData.badge_urls.slice(0, 5).map((badge: {url: string, label: string}, index: number) => (
              <div key={index} className="relative group">
                <img
                  src={badge.url}
                  alt={badge.label}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm hover:scale-110 transition-transform duration-200"
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {badge.label}
                </div>
              </div>
            ))}
            {facilitatorData.badge_urls.length > 5 && (
              <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-xs font-medium border-2 border-white">
                +{facilitatorData.badge_urls.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Key Achievements */}
        {facilitatorData.key_achievements && facilitatorData.key_achievements.length > 0 && (
          <div className="w-full bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Award className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-semibold text-gray-800">Key Achievements</h4>
            </div>
            <ul className="space-y-1">
              {facilitatorData.key_achievements.slice(0, 3).map((achievement: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="text-xs text-gray-700">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* About Me */}
        <div className="w-full bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <User className="h-4 w-4 text-orange-600" />
            <h4 className="text-sm font-semibold text-gray-800">About Me</h4>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
            {facilitatorData.bio || 'About me section will appear here...'}
          </p>
        </div>
      </div>
    </div>
  );
};

const FacilitatorsManagement = () => {
  const { facilitators, loading, addFacilitator, updateFacilitator, deleteFacilitator } = useFacilitators();
  const { getToggleStatus, updateToggle } = useSectionToggles();
  const { toast } = useToast();
  const [isAddFacilitatorOpen, setIsAddFacilitatorOpen] = useState(false);
  const [editingFacilitator, setEditingFacilitator] = useState<any>(null);
  const [newFacilitator, setNewFacilitator] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    membership_level: '',
    lives_impacted: 0,
    key_achievements: [] as string[],
    badge_urls: [] as Array<{url: string, label: string}>,
    is_visible: true
  });

  const [newKeyAchievement, setNewKeyAchievement] = useState('');

  const facilitatorsSectionEnabled = getToggleStatus('facilitators');

  const handleAddFacilitator = async () => {
    if (!newFacilitator.name || !newFacilitator.role || !newFacilitator.bio) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Role, About Me)."
      });
      return;
    }

    try {
      await addFacilitator({
        name: newFacilitator.name,
        role: newFacilitator.role,
        bio: newFacilitator.bio,
        image: newFacilitator.image || '/placeholder.svg',
        membership_level: newFacilitator.membership_level,
        lives_impacted: newFacilitator.lives_impacted,
        key_achievements: newFacilitator.key_achievements,
        badge_urls: newFacilitator.badge_urls,
        is_visible: newFacilitator.is_visible,
        // Set required fields that aren't displayed in frontend to default values
        email: 'not-provided@example.com',
        phone: null,
        expertise: [],
        location: null,
        years_experience: null,
        brand_name: null,
        badges_achieved: [],
        social_links: {}
      });

      setNewFacilitator({
        name: '',
        role: '',
        bio: '',
        image: '',
        membership_level: '',
        lives_impacted: 0,
        key_achievements: [],
        badge_urls: [],
        is_visible: true
      });
      setIsAddFacilitatorOpen(false);
    } catch (error) {
      console.error('Error adding facilitator:', error);
    }
  };

  const handleEditFacilitator = async () => {
    if (!editingFacilitator) return;

    try {
      const result = await updateFacilitator(editingFacilitator.id, {
        name: editingFacilitator.name,
        role: editingFacilitator.role,
        bio: editingFacilitator.bio,
        image: editingFacilitator.image,
        membership_level: editingFacilitator.membership_level,
        lives_impacted: editingFacilitator.lives_impacted,
        key_achievements: editingFacilitator.key_achievements,
        badge_urls: editingFacilitator.badge_urls,
        is_visible: editingFacilitator.is_visible
      });

      if (result) {
        setEditingFacilitator(null);
      }
    } catch (error) {
      console.error('Error updating facilitator:', error);
    }
  };

  const handleRemoveFacilitator = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this facilitator?')) {
      try {
        await deleteFacilitator(id);
      } catch (error) {
        console.error('Error deleting facilitator:', error);
      }
    }
  };

  const addKeyAchievement = (isEditing = false) => {
    const achievement = isEditing ? newKeyAchievement : newKeyAchievement;
    if (achievement.trim()) {
      if (isEditing && editingFacilitator) {
        setEditingFacilitator({
          ...editingFacilitator,
          key_achievements: [...(editingFacilitator.key_achievements || []), achievement.trim()]
        });
      } else {
        setNewFacilitator({
          ...newFacilitator,
          key_achievements: [...newFacilitator.key_achievements, achievement.trim()]
        });
      }
      setNewKeyAchievement('');
    }
  };

  const removeKeyAchievement = (index: number, isEditing = false) => {
    if (isEditing && editingFacilitator) {
      const updated = (editingFacilitator.key_achievements || []).filter((_: string, i: number) => i !== index);
      setEditingFacilitator({
        ...editingFacilitator,
        key_achievements: updated
      });
    } else {
      const updated = newFacilitator.key_achievements.filter((_, i) => i !== index);
      setNewFacilitator({
        ...newFacilitator,
        key_achievements: updated
      });
    }
  };

  const addBadgeUrl = (isEditing = false) => {
    const newBadge = { url: '', label: '' };
    if (isEditing && editingFacilitator) {
      setEditingFacilitator({
        ...editingFacilitator,
        badge_urls: [...(editingFacilitator.badge_urls || []), newBadge]
      });
    } else {
      setNewFacilitator({
        ...newFacilitator,
        badge_urls: [...newFacilitator.badge_urls, newBadge]
      });
    }
  };

  const updateBadgeUrl = (index: number, field: 'url' | 'label', value: string, isEditing = false) => {
    if (isEditing && editingFacilitator) {
      const updated = [...(editingFacilitator.badge_urls || [])];
      updated[index] = { ...updated[index], [field]: value };
      setEditingFacilitator({
        ...editingFacilitator,
        badge_urls: updated
      });
    } else {
      const updated = [...newFacilitator.badge_urls];
      updated[index] = { ...updated[index], [field]: value };
      setNewFacilitator({
        ...newFacilitator,
        badge_urls: updated
      });
    }
  };

  const removeBadgeUrl = (index: number, isEditing = false) => {
    if (isEditing && editingFacilitator) {
      const updated = (editingFacilitator.badge_urls || []).filter((_: any, i: number) => i !== index);
      setEditingFacilitator({
        ...editingFacilitator,
        badge_urls: updated
      });
    } else {
      const updated = newFacilitator.badge_urls.filter((_, i) => i !== index);
      setNewFacilitator({
        ...newFacilitator,
        badge_urls: updated
      });
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
          <h2 className="text-2xl font-bold text-gray-800">Facilitators Management</h2>
          <p className="text-gray-600">Manage facilitators and their profiles</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Section Enabled:</span>
            <Switch
              checked={facilitatorsSectionEnabled}
              onCheckedChange={(checked) => updateToggle('facilitators', checked)}
            />
          </div>
          <Dialog open={isAddFacilitatorOpen} onOpenChange={setIsAddFacilitatorOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Facilitator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Facilitator</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new facilitator to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newFacilitator.name}
                        onChange={(e) => setNewFacilitator(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role/Title *</Label>
                      <Input
                        id="role"
                        value={newFacilitator.role}
                        onChange={(e) => setNewFacilitator(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="e.g., Lead Facilitator, Mentor"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      value={newFacilitator.image}
                      onChange={(e) => setNewFacilitator(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Enter image URL or leave blank for default"
                    />
                  </div>

                  {/* Membership Level and Lives Impacted */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="membership">Membership Level</Label>
                      <select
                        id="membership"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={newFacilitator.membership_level}
                        onChange={(e) => setNewFacilitator(prev => ({ ...prev, membership_level: e.target.value }))}
                      >
                        <option value="">Select Level</option>
                        <option value="Bronze Member">Bronze Member</option>
                        <option value="Silver Member">Silver Member</option>
                        <option value="Gold Member">Gold Member</option>
                        <option value="Platinum Member">Platinum Member</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="lives_impacted">Lives Impacted</Label>
                      <Input
                        id="lives_impacted"
                        type="number"
                        value={newFacilitator.lives_impacted}
                        onChange={(e) => setNewFacilitator(prev => ({ ...prev, lives_impacted: parseInt(e.target.value) || 0 }))}
                        placeholder="Number of lives impacted"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">About Me *</Label>
                    <Textarea
                      id="bio"
                      value={newFacilitator.bio}
                      onChange={(e) => setNewFacilitator(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Write about yourself, your experience, and passion..."
                      rows={4}
                    />
                  </div>

                  {/* Key Achievements Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Key Achievements</Label>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Add a key achievement..."
                          value={newKeyAchievement}
                          onChange={(e) => setNewKeyAchievement(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addKeyAchievement(false)}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addKeyAchievement(false)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {newFacilitator.key_achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <span className="flex-1 text-sm">{achievement}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeKeyAchievement(index, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Badge URLs Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Badge Images</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addBadgeUrl(false)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Badge
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {newFacilitator.badge_urls.map((badge, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                          <Input
                            placeholder="Badge URL"
                            value={badge.url}
                            onChange={(e) => updateBadgeUrl(index, 'url', e.target.value, false)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Badge Name"
                            value={badge.label}
                            onChange={(e) => updateBadgeUrl(index, 'label', e.target.value, false)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeBadgeUrl(index, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newFacilitator.is_visible}
                      onCheckedChange={(checked) => setNewFacilitator(prev => ({ ...prev, is_visible: checked }))}
                    />
                    <Label>Visible on Frontend</Label>
                  </div>

                  <Button onClick={handleAddFacilitator} className="w-full">
                    Add Facilitator
                  </Button>
                </div>

                {/* Live Preview Section */}
                <div className="lg:sticky lg:top-4">
                  <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-center">Live Preview</h3>
                    <FacilitatorPreview facilitatorData={newFacilitator} />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Facilitators ({facilitators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {facilitators.map((facilitator) => {
              const badgeUrls = Array.isArray(facilitator.badge_urls) ? facilitator.badge_urls : [];
              
              return (
                <div key={facilitator.id} className="flex items-start justify-between p-4 bg-white/50 rounded-lg border border-white/30">
                  <div className="flex items-start space-x-4">
                    <img
                      src={facilitator.image || '/placeholder.svg'}
                      alt={facilitator.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{facilitator.name}</h3>
                        {facilitator.is_visible ? 
                          <Eye className="h-4 w-4 text-green-600" /> : 
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      <p className="text-sm text-purple-600 font-medium">{facilitator.role}</p>
                      {facilitator.membership_level && (
                        <p className="text-sm text-purple-600 font-medium">{facilitator.membership_level}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{facilitator.bio}</p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {facilitator.lives_impacted && facilitator.lives_impacted > 0 && (
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{facilitator.lives_impacted} lives impacted</span>
                          </div>
                        )}
                      </div>

                      {/* Display Badge Images */}
                      {badgeUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {badgeUrls.slice(0, 6).map((badge: any, index: number) => (
                            <div key={index} className="relative group">
                              <img
                                src={badge.url}
                                alt={badge.label}
                                className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                title={badge.label}
                              />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {badge.label}
                              </div>
                            </div>
                          ))}
                          {badgeUrls.length > 6 && (
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-medium">
                              +{badgeUrls.length - 6}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log('Editing facilitator data:', facilitator);
                        setEditingFacilitator({
                          ...facilitator,
                          badge_urls: badgeUrls,
                          key_achievements: facilitator.key_achievements || [],
                          bio: facilitator.bio || '',
                          image: facilitator.image || '/placeholder.svg'
                        });
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFacilitator(facilitator.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {facilitators.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No facilitators added yet. Click "Add Facilitator" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Facilitator Dialog */}
      {editingFacilitator && (
        <Dialog open={!!editingFacilitator} onOpenChange={() => setEditingFacilitator(null)}>
          <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Facilitator</DialogTitle>
              <DialogDescription>
                Update the facilitator's information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      value={editingFacilitator.name}
                      onChange={(e) => setEditingFacilitator(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Role/Title *</Label>
                    <Input
                      id="edit-role"
                      value={editingFacilitator.role}
                      onChange={(e) => setEditingFacilitator(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-image">Profile Image URL</Label>
                  <Input
                    id="edit-image"
                    value={editingFacilitator.image}
                    onChange={(e) => setEditingFacilitator(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>

                {/* Membership Level and Lives Impacted */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-membership">Membership Level</Label>
                    <select
                      id="edit-membership"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editingFacilitator.membership_level || ''}
                      onChange={(e) => setEditingFacilitator(prev => ({ ...prev, membership_level: e.target.value }))}
                    >
                      <option value="">Select Level</option>
                      <option value="Bronze Member">Bronze Member</option>
                      <option value="Silver Member">Silver Member</option>
                      <option value="Gold Member">Gold Member</option>
                      <option value="Platinum Member">Platinum Member</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-lives_impacted">Lives Impacted</Label>
                    <Input
                      id="edit-lives_impacted"
                      type="number"
                      value={editingFacilitator.lives_impacted || 0}
                      onChange={(e) => setEditingFacilitator(prev => ({ ...prev, lives_impacted: parseInt(e.target.value) || 0 }))}
                      placeholder="Number of lives impacted"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-bio">About Me *</Label>
                  <Textarea
                    id="edit-bio"
                    value={editingFacilitator.bio}
                    onChange={(e) => setEditingFacilitator(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* Key Achievements Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Key Achievements</Label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Add a key achievement..."
                        value={newKeyAchievement}
                        onChange={(e) => setNewKeyAchievement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addKeyAchievement(true)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addKeyAchievement(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {(editingFacilitator.key_achievements || []).map((achievement: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-sm">{achievement}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeKeyAchievement(index, true)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Badge URLs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Badge Images</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addBadgeUrl(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Badge
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editingFacilitator.badge_urls || []).map((badge: {url: string, label: string}, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                        <Input
                          placeholder="Badge URL"
                          value={badge.url}
                          onChange={(e) => updateBadgeUrl(index, 'url', e.target.value, true)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Badge Name"
                          value={badge.label}
                          onChange={(e) => updateBadgeUrl(index, 'label', e.target.value, true)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeBadgeUrl(index, true)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingFacilitator.is_visible}
                    onCheckedChange={(checked) => setEditingFacilitator(prev => ({ ...prev, is_visible: checked }))}
                  />
                  <Label>Visible on Frontend</Label>
                </div>
                <Button onClick={handleEditFacilitator} className="w-full">
                  Update Facilitator
                </Button>
              </div>

              {/* Live Preview Section */}
              <div className="lg:sticky lg:top-4">
                <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-center">Live Preview</h3>
                  <FacilitatorPreview facilitatorData={editingFacilitator} />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FacilitatorsManagement;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trophy, Star, Award, Edit, Trash2 } from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  description: string;
  points: number;
  category: 'daily' | 'milestone' | 'special';
  icon: string;
  requirements: string;
  createdAt: string;
}

const AchievementsManagement = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    { 
      id: 1, 
      title: "First Steps", 
      description: "Complete your first day in AngelThon", 
      points: 10, 
      category: "daily", 
      icon: "star",
      requirements: "Complete daily check-in",
      createdAt: "2024-01-15"
    },
    { 
      id: 2, 
      title: "Week Warrior", 
      description: "Complete 7 consecutive days", 
      points: 50, 
      category: "milestone", 
      icon: "trophy",
      requirements: "7 consecutive days of participation",
      createdAt: "2024-01-12"
    },
    { 
      id: 3, 
      title: "Community Helper", 
      description: "Help 5 community members", 
      points: 25, 
      category: "special", 
      icon: "award",
      requirements: "Provide support to 5 members",
      createdAt: "2024-01-10"
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    points: 10,
    category: 'daily' as Achievement['category'],
    icon: 'star',
    requirements: ''
  });
  const { toast } = useToast();

  const handleAddAchievement = () => {
    if (!newAchievement.title || !newAchievement.description || !newAchievement.requirements) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    const achievement: Achievement = {
      id: Date.now(),
      title: newAchievement.title,
      description: newAchievement.description,
      points: newAchievement.points,
      category: newAchievement.category,
      icon: newAchievement.icon,
      requirements: newAchievement.requirements,
      createdAt: new Date().toLocaleDateString(),
    };

    setAchievements(prev => [...prev, achievement]);
    setNewAchievement({
      title: '',
      description: '',
      points: 10,
      category: 'daily',
      icon: 'star',
      requirements: ''
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Achievement Created",
      description: "Your achievement has been successfully created."
    });
  };

  const handleDeleteAchievement = (id: number) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
    toast({
      title: "Achievement Deleted",
      description: "The achievement has been removed."
    });
  };

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'milestone': return 'bg-purple-100 text-purple-800';
      case 'special': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'award': return Award;
      default: return Trophy;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievements Management</h2>
          <p className="text-gray-600">Create and manage achievements and badges for users</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Achievement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter achievement title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter achievement description"
                />
              </div>
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={newAchievement.requirements}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="What needs to be done to earn this achievement?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={newAchievement.points}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    placeholder="Points awarded"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newAchievement.category}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, category: e.target.value as Achievement['category'] }))}
                  >
                    <option value="daily">Daily</option>
                    <option value="milestone">Milestone</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <select
                  id="icon"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newAchievement.icon}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, icon: e.target.value }))}
                >
                  <option value="star">Star</option>
                  <option value="trophy">Trophy</option>
                  <option value="award">Award</option>
                </select>
              </div>
              <Button onClick={handleAddAchievement} className="w-full">
                Create Achievement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const Icon = getIcon(achievement.icon);
          return (
            <Card key={achievement.id} className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-yellow-500" />
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteAchievement(achievement.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{achievement.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(achievement.category)}>
                      {achievement.category}
                    </Badge>
                    <span className="text-sm font-semibold text-purple-600">
                      {achievement.points} pts
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Requirements:</strong> {achievement.requirements}
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {achievement.createdAt}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsManagement;

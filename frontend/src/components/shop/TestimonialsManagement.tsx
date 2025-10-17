import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, Star, User, Eye, EyeOff, Upload } from "lucide-react";

interface Testimonial {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  rating: number;
  title: string;
  content: string;
  productId?: string;
  productName?: string;
  isVerified: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  dateCreated: string;
  location?: string;
  tags: string[];
}

interface TestimonialsSettings {
  showOnHomepage: boolean;
  maxHomepageTestimonials: number;
  showRatings: boolean;
  showCustomerPhotos: boolean;
  showVerificationBadges: boolean;
  showLocation: boolean;
  autoApprove: boolean;
  requireEmail: boolean;
  allowAnonymous: boolean;
  moderationEnabled: boolean;
  emailNotifications: boolean;
  displayStyle: 'grid' | 'carousel' | 'list';
  backgroundColor: string;
  textColor: string;
}

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      rating: 5,
      title: 'Amazing Crystal Quality!',
      content: 'The amethyst cluster I ordered exceeded my expectations. The energy is incredible and it arrived perfectly packaged.',
      productId: 'amethyst-cluster',
      productName: 'Amethyst Cluster',
      isVerified: true,
      isApproved: true,
      isFeatured: true,
      isVisible: true,
      dateCreated: '2024-01-15',
      location: 'California, USA',
      tags: ['crystals', 'quality', 'energy']
    },
    {
      id: '2',
      customerName: 'Michael Chen',
      customerEmail: 'michael@example.com',
      rating: 5,
      title: 'Perfect Oracle Cards',
      content: 'These oracle cards have become an essential part of my daily spiritual practice. Highly recommended!',
      productId: 'angel-oracle-cards',
      productName: 'Angel Oracle Cards',
      isVerified: true,
      isApproved: true,
      isFeatured: false,
      isVisible: true,
      dateCreated: '2024-01-10',
      location: 'New York, USA',
      tags: ['oracle-cards', 'spiritual', 'daily-practice']
    },
    {
      id: '3',
      customerName: 'Emma Wilson',
      customerEmail: 'emma@example.com',
      rating: 4,
      title: 'Great Service',
      content: 'Fast shipping and excellent customer service. The healing candle smells amazing and burns evenly.',
      productId: 'healing-candle',
      productName: 'Healing Candle',
      isVerified: false,
      isApproved: false,
      isFeatured: false,
      isVisible: false,
      dateCreated: '2024-01-08',
      location: 'London, UK',
      tags: ['candles', 'service', 'shipping']
    }
  ]);

  const [testimonialsSettings, setTestimonialsSettings] = useState<TestimonialsSettings>({
    showOnHomepage: true,
    maxHomepageTestimonials: 6,
    showRatings: true,
    showCustomerPhotos: true,
    showVerificationBadges: true,
    showLocation: true,
    autoApprove: false,
    requireEmail: true,
    allowAnonymous: false,
    moderationEnabled: true,
    emailNotifications: true,
    displayStyle: 'grid',
    backgroundColor: '#f9fafb',
    textColor: '#1f2937'
  });

  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'approved' && testimonial.isApproved) ||
                         (filterStatus === 'pending' && !testimonial.isApproved) ||
                         (filterStatus === 'featured' && testimonial.isFeatured) ||
                         (filterStatus === 'verified' && testimonial.isVerified);
    
    return matchesSearch && matchesStatus;
  });

  const handleSettingsChange = (field: keyof TestimonialsSettings, value: any) => {
    setTestimonialsSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTestimonial = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      rating: 5,
      title: '',
      content: '',
      isVerified: false,
      isApproved: false,
      isFeatured: false,
      isVisible: true,
      dateCreated: new Date().toISOString().split('T')[0],
      location: '',
      tags: []
    });
    setIsAddDialogOpen(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData(testimonial);
    setIsEditDialogOpen(true);
  };

  const handleSaveTestimonial = () => {
    if (selectedTestimonial) {
      // Update existing testimonial
      setTestimonials(prev => prev.map(t => 
        t.id === selectedTestimonial.id ? { ...formData as Testimonial } : t
      ));
    } else {
      // Add new testimonial
      const newTestimonial: Testimonial = {
        ...formData as Testimonial,
        id: Date.now().toString()
      };
      setTestimonials(prev => [...prev, newTestimonial]);
    }
    
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setSelectedTestimonial(null);
    setFormData({});
  };

  const handleDeleteTestimonial = (testimonialId: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
    }
  };

  const toggleTestimonialStatus = (testimonialId: string, field: keyof Testimonial) => {
    setTestimonials(prev => prev.map(t => 
      t.id === testimonialId ? { ...t, [field]: !t[field] } : t
    ));
  };

  const handleSaveSettings = () => {
    console.log('Saving testimonials settings:', testimonialsSettings);
    alert('Testimonials settings saved successfully!');
  };

  const getStatusBadge = (testimonial: Testimonial) => {
    if (!testimonial.isApproved) return <Badge variant="destructive">Pending</Badge>;
    if (testimonial.isFeatured) return <Badge className="bg-purple-100 text-purple-800">Featured</Badge>;
    if (testimonial.isVerified) return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    return <Badge variant="secondary">Approved</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Testimonials Management</h2>
          <p className="text-gray-600">Manage customer reviews and testimonials</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddTestimonial} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Testimonial
          </Button>
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Testimonials List */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Customer Testimonials</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.customerName}</p>
                          <p className="text-sm text-gray-500">{testimonial.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm">({testimonial.rating})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{testimonial.productName || 'General'}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(testimonial)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(testimonial.dateCreated).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTestimonialStatus(testimonial.id, 'isVisible')}
                          className={testimonial.isVisible ? 'text-green-600' : 'text-gray-400'}
                        >
                          {testimonial.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTestimonial(testimonial)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Display Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.showOnHomepage}
                  onCheckedChange={(checked) => handleSettingsChange('showOnHomepage', checked)}
                />
                <Label>Show on Homepage</Label>
              </div>

              {testimonialsSettings.showOnHomepage && (
                <div>
                  <Label htmlFor="maxHomepage">Max Homepage Items</Label>
                  <Input
                    id="maxHomepage"
                    type="number"
                    value={testimonialsSettings.maxHomepageTestimonials}
                    onChange={(e) => handleSettingsChange('maxHomepageTestimonials', parseInt(e.target.value))}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="displayStyle">Display Style</Label>
                <Select 
                  value={testimonialsSettings.displayStyle} 
                  onValueChange={(value) => handleSettingsChange('displayStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.showRatings}
                  onCheckedChange={(checked) => handleSettingsChange('showRatings', checked)}
                />
                <Label>Show Ratings</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.showCustomerPhotos}
                  onCheckedChange={(checked) => handleSettingsChange('showCustomerPhotos', checked)}
                />
                <Label>Show Customer Photos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.showVerificationBadges}
                  onCheckedChange={(checked) => handleSettingsChange('showVerificationBadges', checked)}
                />
                <Label>Show Verification Badges</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.showLocation}
                  onCheckedChange={(checked) => handleSettingsChange('showLocation', checked)}
                />
                <Label>Show Customer Location</Label>
              </div>
            </div>
          </Card>

          {/* Moderation Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Moderation</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.moderationEnabled}
                  onCheckedChange={(checked) => handleSettingsChange('moderationEnabled', checked)}
                />
                <Label>Enable Moderation</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.autoApprove}
                  onCheckedChange={(checked) => handleSettingsChange('autoApprove', checked)}
                />
                <Label>Auto-approve Reviews</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.requireEmail}
                  onCheckedChange={(checked) => handleSettingsChange('requireEmail', checked)}
                />
                <Label>Require Email</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.allowAnonymous}
                  onCheckedChange={(checked) => handleSettingsChange('allowAnonymous', checked)}
                />
                <Label>Allow Anonymous</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={testimonialsSettings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                />
                <Label>Email Notifications</Label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsManagement;

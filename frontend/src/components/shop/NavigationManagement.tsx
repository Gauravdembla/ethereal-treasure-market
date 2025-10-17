import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, Upload, Menu, Eye, EyeOff } from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
  openInNewTab: boolean;
  isVisible: boolean;
  order: number;
  hasDropdown: boolean;
  dropdownItems?: NavigationItem[];
}

interface NavigationSettings {
  logo: string;
  logoText: string;
  showLogo: boolean;
  showLogoText: boolean;
  cartIconVisible: boolean;
  userMenuVisible: boolean;
  searchBarVisible: boolean;
  mobileMenuEnabled: boolean;
  stickyNavigation: boolean;
  navigationStyle: 'default' | 'transparent' | 'colored';
  backgroundColor: string;
  textColor: string;
}

const NavigationManagement = () => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    {
      id: '1',
      label: 'Home',
      url: '/',
      isExternal: false,
      openInNewTab: false,
      isVisible: true,
      order: 1,
      hasDropdown: false
    },
    {
      id: '2',
      label: 'Shop',
      url: '#products',
      isExternal: false,
      openInNewTab: false,
      isVisible: true,
      order: 2,
      hasDropdown: true,
      dropdownItems: [
        {
          id: '2-1',
          label: 'Crystals',
          url: '/shop/crystals',
          isExternal: false,
          openInNewTab: false,
          isVisible: true,
          order: 1,
          hasDropdown: false
        },
        {
          id: '2-2',
          label: 'Oracle Cards',
          url: '/shop/oracle-cards',
          isExternal: false,
          openInNewTab: false,
          isVisible: true,
          order: 2,
          hasDropdown: false
        }
      ]
    },
    {
      id: '3',
      label: 'AngelThon',
      url: '/angelthon',
      isExternal: false,
      openInNewTab: false,
      isVisible: true,
      order: 3,
      hasDropdown: false
    }
  ]);

  const [navigationSettings, setNavigationSettings] = useState<NavigationSettings>({
    logo: '/logo.png',
    logoText: 'Ethereal Treasure Market',
    showLogo: true,
    showLogoText: true,
    cartIconVisible: true,
    userMenuVisible: true,
    searchBarVisible: false,
    mobileMenuEnabled: true,
    stickyNavigation: true,
    navigationStyle: 'default',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  });

  const [selectedItem, setSelectedItem] = useState<NavigationItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<NavigationItem>>({});

  const handleAddItem = () => {
    setFormData({
      label: '',
      url: '',
      isExternal: false,
      openInNewTab: false,
      isVisible: true,
      order: navigationItems.length + 1,
      hasDropdown: false
    });
    setIsAddDialogOpen(true);
  };

  const handleEditItem = (item: NavigationItem) => {
    setSelectedItem(item);
    setFormData(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (selectedItem) {
      // Update existing item
      setNavigationItems(prev => prev.map(item => 
        item.id === selectedItem.id ? { ...formData as NavigationItem } : item
      ));
    } else {
      // Add new item
      const newItem: NavigationItem = {
        ...formData as NavigationItem,
        id: Date.now().toString()
      };
      setNavigationItems(prev => [...prev, newItem]);
    }
    
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this navigation item?')) {
      setNavigationItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const toggleItemVisibility = (itemId: string) => {
    setNavigationItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isVisible: !item.isVisible } : item
    ));
  };

  const handleSettingsChange = (field: keyof NavigationSettings, value: any) => {
    setNavigationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving navigation settings:', navigationSettings);
    alert('Navigation settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Navigation Management</h2>
          <p className="text-gray-600">Customize your website navigation menu and settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddItem} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Menu Item
          </Button>
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Items */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Menu Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {navigationItems
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.hasDropdown && <Menu className="w-4 h-4 text-gray-400" />}
                        <span className="font-medium">{item.label}</span>
                        {item.isExternal && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            External
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {item.url}
                      </code>
                    </TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItemVisibility(item.id)}
                        className={item.isVisible ? 'text-green-600' : 'text-gray-400'}
                      >
                        {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
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

        {/* Navigation Settings */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Navigation Settings</h3>
            <div className="space-y-4">
              {/* Logo Settings */}
              <div>
                <h4 className="font-medium mb-2">Logo & Branding</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={navigationSettings.showLogo}
                      onCheckedChange={(checked) => handleSettingsChange('showLogo', checked)}
                    />
                    <Label>Show Logo</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={navigationSettings.showLogoText}
                      onCheckedChange={(checked) => handleSettingsChange('showLogoText', checked)}
                    />
                    <Label>Show Logo Text</Label>
                  </div>

                  {navigationSettings.showLogoText && (
                    <div>
                      <Label htmlFor="logoText">Logo Text</Label>
                      <Input
                        id="logoText"
                        value={navigationSettings.logoText}
                        onChange={(e) => handleSettingsChange('logoText', e.target.value)}
                      />
                    </div>
                  )}

                  {navigationSettings.showLogo && (
                    <div>
                      <Label>Logo Upload</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs text-gray-600">Upload logo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Features */}
              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={navigationSettings.cartIconVisible}
                      onCheckedChange={(checked) => handleSettingsChange('cartIconVisible', checked)}
                    />
                    <Label>Cart Icon</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={navigationSettings.userMenuVisible}
                      onCheckedChange={(checked) => handleSettingsChange('userMenuVisible', checked)}
                    />
                    <Label>User Menu</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={navigationSettings.searchBarVisible}
                      onCheckedChange={(checked) => handleSettingsChange('searchBarVisible', checked)}
                    />
                    <Label>Search Bar</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={navigationSettings.mobileMenuEnabled}
                      onCheckedChange={(checked) => handleSettingsChange('mobileMenuEnabled', checked)}
                    />
                    <Label>Mobile Menu</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={navigationSettings.stickyNavigation}
                      onCheckedChange={(checked) => handleSettingsChange('stickyNavigation', checked)}
                    />
                    <Label>Sticky Navigation</Label>
                  </div>
                </div>
              </div>

              {/* Styling */}
              <div>
                <h4 className="font-medium mb-2">Styling</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="navStyle">Navigation Style</Label>
                    <select
                      id="navStyle"
                      value={navigationSettings.navigationStyle}
                      onChange={(e) => handleSettingsChange('navigationStyle', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="default">Default</option>
                      <option value="transparent">Transparent</option>
                      <option value="colored">Colored</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="bgColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bgColor"
                        type="color"
                        value={navigationSettings.backgroundColor}
                        onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={navigationSettings.backgroundColor}
                        onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={navigationSettings.textColor}
                        onChange={(e) => handleSettingsChange('textColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={navigationSettings.textColor}
                        onChange={(e) => handleSettingsChange('textColor', e.target.value)}
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Navigation Item Dialog */}
      <Dialog open={isEditDialogOpen || isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditDialogOpen(false);
          setIsAddDialogOpen(false);
          setSelectedItem(null);
          setFormData({});
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Navigation Item' : 'Add Navigation Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Menu item label"
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="/page or https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isVisible || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                  />
                  <Label>Visible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isExternal || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isExternal: checked }))}
                  />
                  <Label>External Link</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.openInNewTab || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, openInNewTab: checked }))}
                  />
                  <Label>Open in New Tab</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.hasDropdown || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasDropdown: checked }))}
                  />
                  <Label>Has Dropdown</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setIsAddDialogOpen(false);
                  setSelectedItem(null);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveItem}>
                {selectedItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NavigationManagement;

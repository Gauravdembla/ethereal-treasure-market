import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, Upload, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

interface FooterLink {
  id: string;
  title: string;
  url: string;
  isExternal: boolean;
  openInNewTab: boolean;
  order: number;
}

interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
  isVisible: boolean;
  order: number;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  isVisible: boolean;
}

interface FooterSettings {
  companyName: string;
  description: string;
  logo: string;
  showLogo: boolean;
  copyrightText: string;
  showCopyright: boolean;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  showNewsletter: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  showSocialLinks: boolean;
  showContactInfo: boolean;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
}

const FooterManagement = () => {
  const [footerSections, setFooterSections] = useState<FooterSection[]>([
    {
      id: '1',
      title: 'Quick Links',
      isVisible: true,
      order: 1,
      links: [
        { id: '1-1', title: 'About Us', url: '/about', isExternal: false, openInNewTab: false, order: 1 },
        { id: '1-2', title: 'Contact', url: '/contact', isExternal: false, openInNewTab: false, order: 2 },
        { id: '1-3', title: 'FAQ', url: '/faq', isExternal: false, openInNewTab: false, order: 3 }
      ]
    },
    {
      id: '2',
      title: 'Shop',
      isVisible: true,
      order: 2,
      links: [
        { id: '2-1', title: 'Crystals', url: '/shop/crystals', isExternal: false, openInNewTab: false, order: 1 },
        { id: '2-2', title: 'Oracle Cards', url: '/shop/oracle-cards', isExternal: false, openInNewTab: false, order: 2 },
        { id: '2-3', title: 'Candles', url: '/shop/candles', isExternal: false, openInNewTab: false, order: 3 }
      ]
    },
    {
      id: '3',
      title: 'Support',
      isVisible: true,
      order: 3,
      links: [
        { id: '3-1', title: 'Shipping Info', url: '/shipping', isExternal: false, openInNewTab: false, order: 1 },
        { id: '3-2', title: 'Returns', url: '/returns', isExternal: false, openInNewTab: false, order: 2 },
        { id: '3-3', title: 'Privacy Policy', url: '/privacy', isExternal: false, openInNewTab: false, order: 3 }
      ]
    }
  ]);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: '1', platform: 'Facebook', url: 'https://facebook.com', icon: 'facebook', isVisible: true },
    { id: '2', platform: 'Instagram', url: 'https://instagram.com', icon: 'instagram', isVisible: true },
    { id: '3', platform: 'Twitter', url: 'https://twitter.com', icon: 'twitter', isVisible: true },
    { id: '4', platform: 'YouTube', url: 'https://youtube.com', icon: 'youtube', isVisible: false }
  ]);

  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    companyName: 'Ethereal Treasure Market',
    description: 'Discover sacred treasures for your spiritual journey. Handpicked crystals, oracle cards, and spiritual tools.',
    logo: '/logo.png',
    showLogo: true,
    copyrightText: '© 2024 Ethereal Treasure Market. All rights reserved.',
    showCopyright: true,
    backgroundColor: '#1f2937',
    textColor: '#f9fafb',
    linkColor: '#60a5fa',
    showNewsletter: true,
    newsletterTitle: 'Stay Connected',
    newsletterDescription: 'Subscribe to receive updates on new arrivals and spiritual insights.',
    showSocialLinks: true,
    showContactInfo: true,
    contactEmail: 'hello@etherealtreasure.com',
    contactPhone: '+1 (555) 123-4567',
    contactAddress: '123 Spiritual Way, Mystic City, MC 12345'
  });

  const [selectedSection, setSelectedSection] = useState<FooterSection | null>(null);
  const [isEditSectionDialogOpen, setIsEditSectionDialogOpen] = useState(false);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [sectionFormData, setSectionFormData] = useState<Partial<FooterSection>>({});

  const handleSettingsChange = (field: keyof FooterSettings, value: any) => {
    setFooterSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (id: string, field: keyof SocialLink, value: any) => {
    setSocialLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const handleAddSection = () => {
    setSectionFormData({
      title: '',
      isVisible: true,
      order: footerSections.length + 1,
      links: []
    });
    setIsAddSectionDialogOpen(true);
  };

  const handleEditSection = (section: FooterSection) => {
    setSelectedSection(section);
    setSectionFormData(section);
    setIsEditSectionDialogOpen(true);
  };

  const handleSaveSection = () => {
    if (selectedSection) {
      // Update existing section
      setFooterSections(prev => prev.map(section => 
        section.id === selectedSection.id ? { ...sectionFormData as FooterSection } : section
      ));
    } else {
      // Add new section
      const newSection: FooterSection = {
        ...sectionFormData as FooterSection,
        id: Date.now().toString()
      };
      setFooterSections(prev => [...prev, newSection]);
    }
    
    setIsEditSectionDialogOpen(false);
    setIsAddSectionDialogOpen(false);
    setSelectedSection(null);
    setSectionFormData({});
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this footer section?')) {
      setFooterSections(prev => prev.filter(section => section.id !== sectionId));
    }
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setFooterSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, isVisible: !section.isVisible } : section
    ));
  };

  const handleSaveSettings = () => {
    console.log('Saving footer settings:', { footerSettings, footerSections, socialLinks });
    alert('Footer settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Footer Management</h2>
          <p className="text-gray-600">Customize your website footer content and appearance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddSection} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Section
          </Button>
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Footer Sections */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Footer Sections</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section Title</TableHead>
                  <TableHead>Links Count</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {footerSections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>
                      <span className="font-medium">{section.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {section.links.length} links
                      </span>
                    </TableCell>
                    <TableCell>{section.order}</TableCell>
                    <TableCell>
                      <Switch
                        checked={section.isVisible}
                        onCheckedChange={() => toggleSectionVisibility(section.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSection(section)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
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

        {/* Footer Settings */}
        <div className="space-y-6">
          {/* General Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={footerSettings.companyName}
                  onChange={(e) => handleSettingsChange('companyName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={footerSettings.description}
                  onChange={(e) => handleSettingsChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={footerSettings.showLogo}
                  onCheckedChange={(checked) => handleSettingsChange('showLogo', checked)}
                />
                <Label>Show Logo</Label>
              </div>

              {footerSettings.showLogo && (
                <div>
                  <Label>Logo Upload</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-600">Upload logo</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={footerSettings.showCopyright}
                  onCheckedChange={(checked) => handleSettingsChange('showCopyright', checked)}
                />
                <Label>Show Copyright</Label>
              </div>

              {footerSettings.showCopyright && (
                <div>
                  <Label htmlFor="copyrightText">Copyright Text</Label>
                  <Input
                    id="copyrightText"
                    value={footerSettings.copyrightText}
                    onChange={(e) => handleSettingsChange('copyrightText', e.target.value)}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={footerSettings.showContactInfo}
                  onCheckedChange={(checked) => handleSettingsChange('showContactInfo', checked)}
                />
                <Label>Show Contact Info</Label>
              </div>

              {footerSettings.showContactInfo && (
                <>
                  <div>
                    <Label htmlFor="contactEmail">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <Input
                        id="contactEmail"
                        value={footerSettings.contactEmail}
                        onChange={(e) => handleSettingsChange('contactEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <Input
                        id="contactPhone"
                        value={footerSettings.contactPhone}
                        onChange={(e) => handleSettingsChange('contactPhone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactAddress">Address</Label>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-2" />
                      <Textarea
                        id="contactAddress"
                        value={footerSettings.contactAddress}
                        onChange={(e) => handleSettingsChange('contactAddress', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Social Media</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={footerSettings.showSocialLinks}
                  onCheckedChange={(checked) => handleSettingsChange('showSocialLinks', checked)}
                />
                <Label>Show Social Links</Label>
              </div>

              {footerSettings.showSocialLinks && (
                <div className="space-y-3">
                  {socialLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-2">
                      <Switch
                        checked={link.isVisible}
                        onCheckedChange={(checked) => handleSocialLinkChange(link.id, 'isVisible', checked)}
                      />
                      <Label className="w-20">{link.platform}</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)}
                        placeholder={`${link.platform} URL`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FooterManagement;

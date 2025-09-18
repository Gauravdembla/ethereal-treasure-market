import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Eye, Save, RotateCcw } from "lucide-react";

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  backgroundImage: string;
  showButtons: boolean;
  showScrollIndicator: boolean;
  overlayOpacity: number;
  textAlignment: 'left' | 'center' | 'right';
}

const HeroSectionManagement = () => {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: "Ethereal Treasure Market",
    subtitle: "Discover Sacred Treasures for Your Spiritual Journey",
    description: "Handpicked crystals, oracle cards, and spiritual tools to enhance your divine connection and inner wisdom.",
    primaryButtonText: "Shop Sacred Collection",
    primaryButtonLink: "#products",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/about",
    backgroundImage: "/src/assets/hero-divine-background.jpg",
    showButtons: true,
    showScrollIndicator: true,
    overlayOpacity: 0.4,
    textAlignment: 'center'
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleInputChange = (field: keyof HeroContent, value: any) => {
    setHeroContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to database
    console.log('Saving hero content:', heroContent);
    alert('Hero section updated successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default values?')) {
      setHeroContent({
        title: "Ethereal Treasure Market",
        subtitle: "Discover Sacred Treasures for Your Spiritual Journey",
        description: "Handpicked crystals, oracle cards, and spiritual tools to enhance your divine connection and inner wisdom.",
        primaryButtonText: "Shop Sacred Collection",
        primaryButtonLink: "#products",
        secondaryButtonText: "Learn More",
        secondaryButtonLink: "/about",
        backgroundImage: "/src/assets/hero-divine-background.jpg",
        showButtons: true,
        showScrollIndicator: true,
        overlayOpacity: 0.4,
        textAlignment: 'center'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hero Section Management</h2>
          <p className="text-gray-600">Customize the main banner and call-to-action on your homepage</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        /* Preview Mode */
        <Card className="p-0 overflow-hidden">
          <div 
            className="relative min-h-[500px] flex items-center justify-center"
            style={{
              backgroundImage: `url(${heroContent.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: heroContent.overlayOpacity }}
            />
            <div className={`relative z-10 text-white max-w-4xl mx-auto px-6 text-${heroContent.textAlignment}`}>
              <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-4">
                {heroContent.title}
              </h1>
              <h2 className="text-xl md:text-2xl mb-6 text-angelic-cream">
                {heroContent.subtitle}
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                {heroContent.description}
              </p>
              {heroContent.showButtons && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    {heroContent.primaryButtonText}
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                    {heroContent.secondaryButtonText}
                  </Button>
                </div>
              )}
            </div>
            {heroContent.showScrollIndicator && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
                <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Content */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Text Content</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Main Title</Label>
                <Input
                  id="title"
                  value={heroContent.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter main title"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={heroContent.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Enter subtitle"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={heroContent.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter description"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="textAlignment">Text Alignment</Label>
                <select
                  id="textAlignment"
                  value={heroContent.textAlignment}
                  onChange={(e) => handleInputChange('textAlignment', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Buttons Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Buttons & Actions</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showButtons"
                  checked={heroContent.showButtons}
                  onCheckedChange={(checked) => handleInputChange('showButtons', checked)}
                />
                <Label htmlFor="showButtons">Show Action Buttons</Label>
              </div>

              {heroContent.showButtons && (
                <>
                  <div>
                    <Label htmlFor="primaryButtonText">Primary Button Text</Label>
                    <Input
                      id="primaryButtonText"
                      value={heroContent.primaryButtonText}
                      onChange={(e) => handleInputChange('primaryButtonText', e.target.value)}
                      placeholder="Enter primary button text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="primaryButtonLink">Primary Button Link</Label>
                    <Input
                      id="primaryButtonLink"
                      value={heroContent.primaryButtonLink}
                      onChange={(e) => handleInputChange('primaryButtonLink', e.target.value)}
                      placeholder="Enter primary button link"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondaryButtonText">Secondary Button Text</Label>
                    <Input
                      id="secondaryButtonText"
                      value={heroContent.secondaryButtonText}
                      onChange={(e) => handleInputChange('secondaryButtonText', e.target.value)}
                      placeholder="Enter secondary button text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondaryButtonLink">Secondary Button Link</Label>
                    <Input
                      id="secondaryButtonLink"
                      value={heroContent.secondaryButtonLink}
                      onChange={(e) => handleInputChange('secondaryButtonLink', e.target.value)}
                      placeholder="Enter secondary button link"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="showScrollIndicator"
                  checked={heroContent.showScrollIndicator}
                  onCheckedChange={(checked) => handleInputChange('showScrollIndicator', checked)}
                />
                <Label htmlFor="showScrollIndicator">Show Scroll Indicator</Label>
              </div>
            </div>
          </Card>

          {/* Background & Styling */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Background & Styling</h3>
            <div className="space-y-4">
              <div>
                <Label>Background Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">Recommended: 1920x1080px, JPG/PNG</p>
                </div>
              </div>

              <div>
                <Label htmlFor="overlayOpacity">Overlay Opacity: {Math.round(heroContent.overlayOpacity * 100)}%</Label>
                <input
                  type="range"
                  id="overlayOpacity"
                  min="0"
                  max="1"
                  step="0.1"
                  value={heroContent.overlayOpacity}
                  onChange={(e) => handleInputChange('overlayOpacity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* SEO & Meta */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">SEO & Meta Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO description for search engines"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="spiritual, crystals, oracle cards, healing"
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HeroSectionManagement;

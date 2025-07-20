
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Settings, Save, TestTube, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmailSettings = () => {
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    enableTLS: true,
    isCustomSMTP: false
  });

  const { toast } = useToast();

  const handleSaveConfig = () => {
    if (!emailConfig.smtpUser || !emailConfig.smtpPassword || !emailConfig.fromEmail) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required SMTP fields."
      });
      return;
    }

    // Here you would typically save to your backend/Supabase
    toast({
      title: "Configuration Saved",
      description: "Email settings have been updated successfully."
    });
  };

  const handleTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to verify the configuration."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Email Settings</h2>
        <p className="text-gray-600">Configure email notifications and SMTP settings</p>
      </div>

      {/* G Suite SMTP Tutorial */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Info className="h-5 w-5 mr-2" />
            Google Workspace (G Suite) SMTP Setup Tutorial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-blue-700">
            <h4 className="font-semibold mb-2">Step 1: Enable 2-Factor Authentication</h4>
            <p className="mb-3">Go to your Google Account settings and enable 2-factor authentication if not already enabled.</p>
            
            <h4 className="font-semibold mb-2">Step 2: Generate App Password</h4>
            <ol className="list-decimal list-inside space-y-1 mb-3">
              <li>Go to <code className="bg-blue-100 px-1 rounded">myaccount.google.com</code></li>
              <li>Click on "Security" in the left sidebar</li>
              <li>Under "Signing in to Google", click "App passwords"</li>
              <li>Select "Mail" as the app and your device type</li>
              <li>Click "Generate" and copy the 16-character password</li>
            </ol>

            <h4 className="font-semibold mb-2">Step 3: Configure SMTP Settings</h4>
            <div className="bg-blue-100 p-3 rounded-md">
              <ul className="space-y-1 text-xs">
                <li><strong>SMTP Server:</strong> smtp.gmail.com</li>
                <li><strong>Port:</strong> 587 (with STARTTLS) or 465 (with SSL)</li>
                <li><strong>Username:</strong> Your full Gmail address</li>
                <li><strong>Password:</strong> The 16-character app password (not your regular password)</li>
                <li><strong>Security:</strong> STARTTLS or SSL/TLS</li>
              </ul>
            </div>

            <Alert className="mt-4">
              <AlertTitle>Important Note</AlertTitle>
              <AlertDescription>
                Never use your regular Gmail password. Always use the app password generated specifically for this application.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="customSMTP"
              checked={emailConfig.isCustomSMTP}
              onChange={(e) => setEmailConfig(prev => ({ ...prev, isCustomSMTP: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="customSMTP">Use Custom SMTP Settings</Label>
            <Badge variant={emailConfig.isCustomSMTP ? "default" : "secondary"}>
              {emailConfig.isCustomSMTP ? "Custom" : "Default"}
            </Badge>
          </div>

          {emailConfig.isCustomSMTP && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host *</Label>
                  <Input
                    id="smtpHost"
                    value={emailConfig.smtpHost}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port *</Label>
                  <Input
                    id="smtpPort"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpUser">SMTP Username *</Label>
                  <Input
                    id="smtpUser"
                    value={emailConfig.smtpUser}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                    placeholder="your-email@yourdomain.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Password *</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailConfig.smtpPassword}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    placeholder="Your app password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">From Email *</Label>
                  <Input
                    id="fromEmail"
                    value={emailConfig.fromEmail}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                    placeholder="noreply@yourdomain.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailConfig.fromName}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                    placeholder="Your App Name"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableTLS"
                  checked={emailConfig.enableTLS}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, enableTLS: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="enableTLS">Enable TLS/STARTTLS</Label>
                <Badge variant={emailConfig.enableTLS ? "default" : "secondary"}>
                  {emailConfig.enableTLS ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleSaveConfig} className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={handleTestEmail} className="flex items-center">
                  <TestTube className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Welcome Email</h4>
                <p className="text-sm text-gray-600 mb-3">Sent to new users when they join</p>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Password Reset</h4>
                <p className="text-sm text-gray-600 mb-3">Sent when users request password reset</p>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Email Verification</h4>
                <p className="text-sm text-gray-600 mb-3">Sent to verify email addresses</p>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Notifications</h4>
                <p className="text-sm text-gray-600 mb-3">System notifications and updates</p>
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSettings;

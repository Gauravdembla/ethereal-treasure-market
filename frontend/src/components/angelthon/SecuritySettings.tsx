
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Smartphone, Mail, AlertTriangle, QrCode } from "lucide-react";

const SecuritySettings = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQrCode, setShowQrCode] = useState(false);

  const handleEnable2FA = async () => {
    // TODO: Implement actual 2FA setup with Supabase
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    
    setBackupCodes(codes);
    setTwoFactorEnabled(true);
    setShowBackupCodes(true);
    
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been enabled for your account."
    });
  };

  const handleDisable2FA = async () => {
    if (window.confirm('Are you sure you want to disable two-factor authentication?')) {
      setTwoFactorEnabled(false);
      setGoogleAuthEnabled(false);
      setBackupCodes([]);
      setShowBackupCodes(false);
      setShowQrCode(false);
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled."
      });
    }
  };

  const handleEnableGoogleAuth = async () => {
    // Generate a mock QR code URL for Google Authenticator
    const secret = Math.random().toString(36).substring(2, 18);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/ShreedEmbla:${encodeURIComponent('admin@shreedembla.com')}?secret=${secret}&issuer=ShreedEmbla`;
    
    setQrCodeUrl(qrUrl);
    setGoogleAuthEnabled(true);
    setShowQrCode(true);
    
    toast({
      title: "Google Authenticator Setup",
      description: "Scan the QR code with Google Authenticator app."
    });
  };

  const generateNewBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    setShowBackupCodes(true);
    
    toast({
      title: "New Backup Codes Generated",
      description: "Please save these new backup codes in a secure location."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Security & 2FA</h2>
        <p className="text-gray-600">Manage your account security and two-factor authentication</p>
      </div>

      {/* Two-Factor Authentication */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable 2FA</p>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
            />
          </div>

          {twoFactorEnabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">2FA is enabled</span>
              </div>

              {/* Google Authenticator Section */}
              <div className="bg-blue-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Google Authenticator</span>
                  </div>
                  <Switch
                    checked={googleAuthEnabled}
                    onCheckedChange={googleAuthEnabled ? () => setGoogleAuthEnabled(false) : handleEnableGoogleAuth}
                  />
                </div>
                {!googleAuthEnabled && (
                  <p className="text-sm text-blue-700">
                    Use Google Authenticator app for time-based codes
                  </p>
                )}
              </div>
              
              <Button variant="outline" onClick={generateNewBackupCodes}>
                <Key className="h-4 w-4 mr-2" />
                Generate New Backup Codes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Authenticator QR Code */}
      {showQrCode && qrCodeUrl && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <QrCode className="h-5 w-5 mr-2" />
              Setup Google Authenticator
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-blue-700 mb-4">
              Scan this QR code with Google Authenticator app
            </p>
            <div className="flex justify-center mb-4">
              <img src={qrCodeUrl} alt="QR Code for Google Authenticator" className="border rounded" />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowQrCode(false)}
            >
              I've added it to my app
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Backup Codes */}
      {showBackupCodes && backupCodes.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Backup Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-4">
              Save these backup codes in a secure location. You can use them to access your account if you lose your 2FA device.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white p-2 rounded border font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowBackupCodes(false)}
            >
              I've saved these codes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connected Accounts */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">Google Account</p>
                <p className="text-sm text-gray-600">Sign in with Google</p>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-800">Not Connected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign out from all devices</p>
              <p className="text-sm text-gray-600">This will sign you out from all devices except this one</p>
            </div>
            <Button variant="outline">
              Sign Out All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;

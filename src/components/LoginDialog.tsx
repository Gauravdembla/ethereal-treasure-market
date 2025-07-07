import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [activeTab, setActiveTab] = useState("email");
  const { login } = useAuth();

  const handleEmailLogin = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }
    // Mock login - OTP will be implemented later
    login();
    onOpenChange(false);
  };

  const handleMobileLogin = () => {
    if (!mobile) {
      alert("Please enter your mobile number");
      return;
    }
    // Mock login - WhatsApp OTP will be implemented later
    login();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-angelic-deep text-center">
            Welcome to Angels On Earth
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobile
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleEmailLogin} variant="divine" className="w-full">
              Send OTP to Email
            </Button>
            <p className="text-xs text-center text-angelic-deep/60">
              We'll send you a verification code via email
            </p>
          </TabsContent>
          
          <TabsContent value="mobile" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            <Button onClick={handleMobileLogin} variant="divine" className="w-full">
              Send OTP via WhatsApp
            </Button>
            <p className="text-xs text-center text-angelic-deep/60">
              We'll send you a verification code via WhatsApp
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-xs text-angelic-deep/60 pt-4 border-t">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
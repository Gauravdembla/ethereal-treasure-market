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
  onLoginSuccess?: () => void;
}

const LoginDialog = ({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) => {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [activeTab, setActiveTab] = useState("email");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const { login, loginWithMobile, sendMobileOTP } = useAuth();

  const handleEmailLogin = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }
    // Mock login - OTP will be implemented later
    login();
    onOpenChange(false);
    onLoginSuccess?.();
  };

  const handleSendOTP = async () => {
    if (!mobile) {
      alert("Please enter your mobile number");
      return;
    }

    const result = await sendMobileOTP(mobile);
    if (result.success) {
      setOtpSent(true);
      setDemoOtp(result.otp || "");
      if (mobile === '919891324442') {
        alert(`Demo OTP sent: ${result.otp} (This is for testing only)`);
      }
    } else {
      alert("Failed to send OTP. Try demo number: 919891324442");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      alert("Please enter the OTP");
      return;
    }

    const success = await loginWithMobile(mobile, otp);
    if (success) {
      onOpenChange(false);
      onLoginSuccess?.();
      // Reset form
      setMobile("");
      setOtp("");
      setOtpSent(false);
      setDemoOtp("");
    } else {
      alert("Invalid OTP. Please try again.");
    }
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
            {!otpSent ? (
              <>
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
                <Button onClick={handleSendOTP} variant="divine" className="w-full">
                  Send OTP via WhatsApp
                </Button>
                <p className="text-xs text-center text-angelic-deep/60">
                  Try demo number: 919891324442
                </p>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={4}
                  />
                </div>
                <Button onClick={handleVerifyOTP} variant="divine" className="w-full">
                  Verify OTP
                </Button>
                <div className="flex justify-between text-xs">
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setDemoOtp("");
                    }}
                    className="text-angelic-deep/60 hover:text-angelic-deep"
                  >
                    Change Number
                  </button>
                  <button
                    onClick={handleSendOTP}
                    className="text-angelic-deep/60 hover:text-angelic-deep"
                  >
                    Resend OTP
                  </button>
                </div>
                {demoOtp && (
                  <p className="text-xs text-center text-green-600 bg-green-50 p-2 rounded">
                    Demo OTP: {demoOtp}
                  </p>
                )}
              </>
            )}
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
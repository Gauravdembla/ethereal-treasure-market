import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { ArrowLeft, HelpCircle, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')} 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-playfair font-bold text-gray-800">
                FAQs
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-angelic-deep" />
            <h2 className="text-xl font-semibold text-angelic-deep">Angel Coins Redemption Eligibility</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Angel Coins redemption facility is available for members with Gold, Platinum, or Diamond tiers. If your account shows "No Membership", please upgrade to avail this benefit.
          </p>
          <ul className="list-disc pl-6 mt-3 text-sm text-angelic-deep/80 space-y-1">
            <li>Diamond: up to 20% of pre-GST amount</li>
            <li>Platinum: up to 10% of pre-GST amount</li>
            <li>Gold: up to 5% of pre-GST amount</li>
          </ul>
          <p className="text-xs text-angelic-deep/60 mt-3">Note: Limits may be configured by the admin and can vary.</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold text-angelic-deep">How do I upgrade my membership?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            If you believe you should have an active membership, please check your profile information or contact support for assistance.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => navigate('/profile')}>Go to Profile</Button>
            <Button variant="divine" onClick={() => navigate('/checkout')}>Go to Checkout</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;


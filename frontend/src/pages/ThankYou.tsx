import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ThankYou = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('order') || 'AOE0001';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
        <h1 className="text-3xl font-playfair mt-4 text-angelic-deep">Thank you for your order!</h1>
        <p className="mt-2 text-angelic-deep/70">Your order has been placed successfully.</p>
        <div className="mt-4 p-4 border rounded-lg bg-white/70">
          <div className="text-sm text-angelic-deep/80">Order ID</div>
          <div className="text-xl font-semibold text-angelic-deep">{orderId}</div>
        </div>
        <div className="mt-6 flex gap-2 justify-center">
          <Button variant="outline" onClick={() => navigate('/profile')}>View Orders</Button>
          <Button onClick={() => navigate('/')}>Continue Shopping <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;


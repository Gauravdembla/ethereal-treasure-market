import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { escapeHtml } from "@/services/razorpayService";

interface PaymentThankYouProps {
  name: string;
  amount: number;
  clientOrderId: string;
  paymentId: string;
  onViewOrder: () => void;
}

export default function PaymentThankYou({
  name,
  amount,
  clientOrderId,
  paymentId,
  onViewOrder,
}: PaymentThankYouProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-angelic-cream/30 to-white/50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="font-playfair font-bold text-3xl md:text-4xl text-angelic-deep mb-4">
          Congratulations {escapeHtml(name)} 🎉
        </h1>

        <div className="space-y-4 mb-8 text-lg text-angelic-deep/80">
          <p>
            We have received your payment of{" "}
            <span className="font-semibold text-primary">
              ₹{amount.toFixed(2)}
            </span>
            .
          </p>

          <p>
            Your Order ID{" "}
            <span className="font-semibold text-primary">
              {escapeHtml(clientOrderId)}
            </span>{" "}
            is confirmed.
          </p>

          <p>
            Your successful payment ID is{" "}
            <span className="font-mono text-sm text-angelic-deep/70 break-all">
              {escapeHtml(paymentId)}
            </span>
            .
          </p>

          <p className="text-base">
            You'll receive confirmation on WhatsApp and email shortly.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onViewOrder}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            View Order Details
          </Button>

          <p className="text-sm text-angelic-deep/60">
            Need help?{" "}
            <a
              href="mailto:support@shreedembla.com"
              className="text-primary hover:underline font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}


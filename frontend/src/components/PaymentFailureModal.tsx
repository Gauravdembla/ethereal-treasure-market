import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { escapeHtml } from "@/services/razorpayService";

interface PaymentFailureModalProps {
  isOpen: boolean;
  errorMessage: string;
  onClose: () => void;
}

export default function PaymentFailureModal({
  isOpen,
  errorMessage,
  onClose,
}: PaymentFailureModalProps) {
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(6);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 6;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6 md:p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-red-600 mb-3">
          Payment Failed
        </h3>

        <p className="text-angelic-deep/80 mb-6 text-sm md:text-base">
          {escapeHtml(errorMessage)}
        </p>

        <p className="text-angelic-deep/70 mb-6 font-semibold">
          Reopening the form in <span className="text-red-600">{countdown}</span>
          s…
        </p>

        <Button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          Show Form Now
        </Button>
      </Card>
    </div>
  );
}


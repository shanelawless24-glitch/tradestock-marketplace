"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertTriangle } from "lucide-react";

interface PaymentRequiredModalProps {
  isOpen: boolean;
  status?: string;
}

export function PaymentRequiredModal({ isOpen, status }: PaymentRequiredModalProps) {
  const router = useRouter();

  const getStatusMessage = () => {
    switch (status) {
      case "past_due":
        return "Your payment is overdue. Please update your payment method to continue.";
      case "unpaid":
        return "Your subscription payment failed. Please complete payment to restore access.";
      case "canceled":
        return "Your subscription has been canceled. Reactivate to continue using the platform.";
      default:
        return "An active subscription is required to access this feature.";
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" hideClose>
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <DialogTitle className="text-xl">Payment Required</DialogTitle>
          <DialogDescription className="text-base">
            {getStatusMessage()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            size="lg"
            onClick={() => router.push("/dealer/billing")}
            className="w-full"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Go to Billing
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to manage your subscription
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

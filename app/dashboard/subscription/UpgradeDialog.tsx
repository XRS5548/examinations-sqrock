// components/dashboard/subscription/UpgradeDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createOrUpdateSubscription } from "@/actions/subscription";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";

const planDetails = {
  Basic: { price: 29, examLimit: 10, studentLimit: 100 },
  Pro: { price: 79, examLimit: 50, studentLimit: 500 },
  Enterprise: { price: 199, examLimit: -1, studentLimit: -1 },
};

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string | null;
  onUpgraded: () => void;
}

export function UpgradeDialog({ open, onOpenChange, planName, onUpgraded }: UpgradeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<typeof planDetails.Pro | null>(null);

  useEffect(() => {
    if (planName && planDetails[planName as keyof typeof planDetails]) {
      setPlan(planDetails[planName as keyof typeof planDetails]);
    }
  }, [planName]);

  const handleUpgrade = async () => {
    if (!planName) return;

    setLoading(true);
    try {
      const result = await createOrUpdateSubscription({
        planName,
        price: plan?.price || 0,
        examLimit: plan?.examLimit || 0,
        studentLimit: plan?.studentLimit || 0,
      });

      if (result.success) {
        toast.success(`Successfully upgraded to ${planName} plan!`);
        onUpgraded();
        onOpenChange(false);
      } else {
        toast.error(result.error?.toString() || "Failed to upgrade subscription");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade to {planName} Plan</DialogTitle>
          <DialogDescription>
            Review the details before confirming your upgrade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your current subscription will be replaced immediately. Any unused time will be prorated.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Plan</span>
              <Badge variant="default" className="text-lg">
                {planName}
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Price</span>
              <span className="text-lg font-bold">${plan.price}/month</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Exam Limit</span>
              <span>{plan.examLimit === -1 ? "Unlimited" : `${plan.examLimit} exams`}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Student Limit</span>
              <span>{plan.studentLimit === -1 ? "Unlimited" : `${plan.studentLimit} students`}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm Upgrade to ${planName}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
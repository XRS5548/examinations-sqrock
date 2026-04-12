// components/dashboard/subscription/CurrentPlanCard.tsx
"use client";

import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { cancelSubscription } from "@/actions/subscription";
import { toast } from "sonner";
import { useState } from "react";

type Subscription = {
  id: number;
  planName: string | null;
  price: number | null;
  examLimit: number | null;
  studentLimit: number | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string | null;
};

interface CurrentPlanCardProps {
  subscription: Subscription | null;
}

export function CurrentPlanCard({ subscription }: CurrentPlanCardProps) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!subscription) return;
    
    setCancelling(true);
    try {
      const result = await cancelSubscription(subscription.id);
      if (result.success) {
        toast.success("Subscription cancelled successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setCancelling(false);
    }
  };

  const isExpiringSoon = (endDate: Date | null) => {
    if (!endDate) return false;
    const daysLeft = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You don't have an active subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Choose a plan below to start using ExaminerMax
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusColor = subscription.status === "active" ? "bg-green-600" : "bg-red-600";
  const expiringSoon = isExpiringSoon(subscription.endDate);

  return (
    <Card className="relative overflow-hidden">
      {subscription.status === "active" && (
        <div className="absolute top-0 right-0">
          <Badge className="m-4 bg-green-600">Active</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">Current Plan</CardTitle>
        <CardDescription>
          Your active subscription details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Plan Name</span>
            </div>
            <p className="text-2xl font-bold">{subscription.planName || "N/A"}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Price</span>
            </div>
            <p className="text-2xl font-bold">
              {subscription.price ? `$${subscription.price}/month` : "Custom Pricing"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Exam Limit</span>
            </div>
            <p className="text-lg">
              {subscription.examLimit === -1 ? "Unlimited" : `${subscription.examLimit} exams`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Student Limit</span>
            </div>
            <p className="text-lg">
              {subscription.studentLimit === -1 ? "Unlimited" : `${subscription.studentLimit} students`}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Start Date</span>
            </div>
            <p className="text-sm">
              {subscription.startDate
                ? format(new Date(subscription.startDate), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">End Date</span>
            </div>
            <div>
              <p className="text-sm">
                {subscription.endDate
                  ? format(new Date(subscription.endDate), "MMM dd, yyyy")
                  : "N/A"}
              </p>
              {expiringSoon && (
                <Badge variant="destructive" className="mt-1">
                  Expiring Soon!
                </Badge>
              )}
            </div>
          </div>
        </div>

        {subscription.status === "active" && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add missing import
import { CreditCard } from "lucide-react";
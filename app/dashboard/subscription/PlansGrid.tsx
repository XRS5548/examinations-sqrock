// components/dashboard/subscription/PlansGrid.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { UpgradeDialog } from "./UpgradeDialog"; 

const plans = [
  {
    name: "Basic",
    price: 29,
    examLimit: 10,
    studentLimit: 100,
    features: [
      "Up to 10 exams",
      "Up to 100 students",
      "Basic analytics",
      "Email support",
      "MCQ questions only",
    ],
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    recommended: false,
  },
  {
    name: "Pro",
    price: 79,
    examLimit: 50,
    studentLimit: 500,
    features: [
      "Up to 50 exams",
      "Up to 500 students",
      "Advanced analytics",
      "Priority support",
      "MCQ + Subjective questions",
      "Auto-grading",
      "Cheating detection",
    ],
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    recommended: true,
  },
  {
    name: "Enterprise",
    price: 199,
    examLimit: -1,
    studentLimit: -1,
    features: [
      "Unlimited exams",
      "Unlimited students",
      "Custom analytics",
      "24/7 dedicated support",
      "All question types",
      "Advanced cheating detection",
      "API access",
      "White-labeling",
      "SLA guarantee",
    ],
    icon: Building2,
    color: "from-orange-500 to-red-500",
    recommended: false,
  },
];

interface PlansGridProps {
  currentPlan: string | null;
}

export function PlansGrid({ currentPlan }: PlansGridProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setUpgradeDialogOpen(true);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.name;
            const Icon = plan.icon;
            
            return (
              <Card
                key={plan.name}
                className={`relative overflow-hidden transition-all duration-200 ${
                  plan.recommended ? "border-2 border-purple-500 shadow-lg" : ""
                } ${isCurrent ? "opacity-75" : ""}`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0">
                    <Badge className="m-4 bg-gradient-to-r from-purple-500 to-pink-500">
                      Recommended
                    </Badge>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute top-0 left-0">
                    <Badge className="m-4 bg-green-600">Current Plan</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${plan.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl mt-4">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      ${plan.price}
                    </span>
                    /month
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Exams</span>
                      <span className="font-medium">
                        {plan.examLimit === -1 ? "Unlimited" : `${plan.examLimit} exams`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Students</span>
                      <span className="font-medium">
                        {plan.studentLimit === -1 ? "Unlimited" : `${plan.studentLimit} students`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <UpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        planName={selectedPlan}
        onUpgraded={() => window.location.reload()}
      />
    </>
  );
}
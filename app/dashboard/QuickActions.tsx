// components/dashboard/home/QuickActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BarChart3, FileQuestion, UserPlus, Eye } from "lucide-react";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: "Create Exam",
      description: "Create a new exam for your students",
      icon: Plus,
      onClick: () => router.push("/dashboard/exams"),
      variant: "default" as const,
      color: "",
    },
    {
      title: "Add Students",
      description: "Add new students to your platform",
      icon: UserPlus,
      onClick: () => router.push("/dashboard/students"),
      variant: "outline" as const,
      color: "border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950",
    },
    {
      title: "View Results",
      description: "Check student exam results",
      icon: BarChart3,
      onClick: () => router.push("/dashboard/results"),
      variant: "outline" as const,
      color: "border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950",
    },
    {
      title: "Manage Questions",
      description: "Create and edit exam questions",
      icon: FileQuestion,
      onClick: () => {
        // Navigate to first exam or exams list
        router.push("/dashboard/exams");
      },
      variant: "outline" as const,
      color: "border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks to manage your exams and students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant={action.variant}
                onClick={action.onClick}
                className={`h-auto flex-col items-start gap-2 p-4 ${action.variant === "default" ? action.color : ""}`}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
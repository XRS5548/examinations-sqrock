// components/dashboard/home/StatsCards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalExams: number;
    totalStudents: number;
    completedExams: number;
    cheatingCases: number;
    previousPeriod?: {
      totalExams: number;
      totalStudents: number;
      completedExams: number;
      cheatingCases: number;
    };
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Exams",
      value: stats.totalExams,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      iconColor: "text-blue-600",
      trend: stats.previousPeriod 
        ? ((stats.totalExams - stats.previousPeriod.totalExams) / stats.previousPeriod.totalExams) * 100 
        : 0,
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      iconColor: "text-purple-600",
      trend: stats.previousPeriod 
        ? ((stats.totalStudents - stats.previousPeriod.totalStudents) / stats.previousPeriod.totalStudents) * 100 
        : 0,
    },
    {
      title: "Completed Exams",
      value: stats.completedExams,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      iconColor: "text-green-600",
      trend: stats.previousPeriod 
        ? ((stats.completedExams - stats.previousPeriod.completedExams) / stats.previousPeriod.completedExams) * 100 
        : 0,
    },
    {
      title: "Cheating Cases",
      value: stats.cheatingCases,
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50 dark:bg-red-950/50",
      iconColor: "text-red-600",
      trend: stats.previousPeriod 
        ? ((stats.cheatingCases - stats.previousPeriod.cheatingCases) / stats.previousPeriod.cheatingCases) * 100 
        : 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.trend >= 0;
        
        return (
          <Card key={card.title} className="relative overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${card.color}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.trend !== 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(card.trend).toFixed(1)}% from last month
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
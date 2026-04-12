// components/dashboard/exams/results/ResultsStats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, XCircle, AlertTriangle } from "lucide-react";

interface ResultsStatsProps {
  stats: {
    total: number;
    passed: number;
    failed: number;
    cheating: number;
  };
  totalMarks: number;
}

export function ResultsStats({ stats, totalMarks }: ResultsStatsProps) {
  const passRate = stats.total > 0 ? (stats.passed / stats.total) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Registered for this exam
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Passed</CardTitle>
          <Trophy className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
          <p className="text-xs text-muted-foreground">
            {passRate.toFixed(1)}% pass rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <p className="text-xs text-muted-foreground">
            Below passing marks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cheating Cases</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.cheating}</div>
          <p className="text-xs text-muted-foreground">
            Flagged for cheating
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
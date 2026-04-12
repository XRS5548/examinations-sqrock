// app/dashboard/page.tsx
import { Suspense } from "react";
import { getUserCompany } from "@/actions/company";
import { getDashboardStats, getRecentExams, getRecentStudents } from "@/actions/dashboard";
import { StatsCards } from "./StatsCards";
import { QuickActions } from "./QuickActions"; 
import { RecentExams } from "./RecentExams";
import { RecentStudents } from "./RecentStudents";
import { AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const company = await getUserCompany();
  
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  const stats = await getDashboardStats();
  const recentExamsRaw = await getRecentExams();
  const recentStudents = await getRecentStudents();

  // Transform recentExams to match expected types
  const recentExams = recentExamsRaw.map(exam => ({
    id: exam.id,
    name: exam.name,
    examDate: exam.examDate,
    isLive: exam.isLive ?? false, // Convert null to false
    createdAt: exam.createdAt,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your exam platform.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading stats...</div>}>
        <StatsCards stats={stats} />
      </Suspense>

      <Suspense fallback={<div className="text-center py-12">Loading quick actions...</div>}>
        <QuickActions />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<div className="text-center py-12">Loading recent exams...</div>}>
          <RecentExams exams={recentExams} />
        </Suspense>

        <Suspense fallback={<div className="text-center py-12">Loading recent students...</div>}>
          <RecentStudents students={recentStudents} />
        </Suspense>
      </div>
    </div>
  );
}
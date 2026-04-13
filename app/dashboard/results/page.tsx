// app/dashboard/results/page.tsx
import { Suspense } from "react";
import { db } from "@/db";
import { examRegistrations, students, exams } from "@/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { getUserCompany } from "@/actions/company";
import { ResultsTable } from "./ResultsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const company = await getUserCompany();
  
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  // Fetch all submitted registrations with student and exam details
  const registrations = await db.select({
    id: examRegistrations.id,
    examId: examRegistrations.examId,
    studentId: examRegistrations.studentId,
    rollNumber: examRegistrations.rollNumber,
    score: examRegistrations.score,
    cheating: examRegistrations.cheating,
    status: examRegistrations.status,
    submittedAt: examRegistrations.submittedAt,
    studentName: students.name,
    studentEmail: students.email,
    examName: exams.name,
    examTotalMarks: exams.totalMarks,
    examResultAnnounced: exams.resultAnnounced,
  })
  .from(examRegistrations)
  .leftJoin(students, eq(examRegistrations.studentId, students.id))
  .leftJoin(exams, eq(examRegistrations.examId, exams.id))
  .where(
    and(
      isNotNull(examRegistrations.submittedAt),
      eq(students.companyId, company.id)
    )
  )
  .orderBy(desc(examRegistrations.submittedAt));

  // Transform data
  const transformedRegistrations = registrations.map(reg => ({
    id: reg.id,
    examId: reg.examId ?? 0,
    studentId: reg.studentId ?? 0,
    rollNumber: reg.rollNumber,
    score: reg.score ?? 0,
    cheating: reg.cheating ?? false,
    status: reg.status,
    submittedAt: reg.submittedAt,
    studentName: reg.studentName ?? "Unknown",
    studentEmail: reg.studentEmail ?? "No email",
    examName: reg.examName ?? "Unknown Exam",
    examTotalMarks: reg.examTotalMarks ?? 0,
    examResultAnnounced: reg.examResultAnnounced ?? false,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results Management</h1>
        <p className="text-muted-foreground mt-2">
          View and evaluate student results across all exams
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading results...</div>}>
        <ResultsTable initialRegistrations={transformedRegistrations} />
      </Suspense>
    </div>
  );
}
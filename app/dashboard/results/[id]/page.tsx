// app/dashboard/results/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { examRegistrations, students, exams } from "@/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { getUserCompany } from "@/actions/company";
import { ResultsTable } from "./ResultsTable"; 

export const dynamic = 'force-dynamic';

interface ResultsPageProps {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  // Handle params as Promise (Next.js 15+)
  const resolvedParams = await params;
  const examId = parseInt(resolvedParams.id);
  
  const company = await getUserCompany();
  
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  // Validate examId
  if (isNaN(examId)) {
    notFound();
  }

  // Verify exam exists and belongs to this company
  const examResult = await db
    .select()
    .from(exams)
    .where(
      and(
        eq(exams.id, examId),
        eq(exams.companyId, company.id)
      )
    )
    .limit(1);

  const exam = examResult[0];

  if (!exam) {
    notFound();
  }

  // Fetch all submitted registrations for this specific exam
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
      eq(exams.companyId, company.id),
      eq(examRegistrations.examId, examId)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Results: {exam.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Total Marks: {exam.totalMarks} | 
              Status: {exam.resultAnnounced ? "Results Announced" : "Results Pending"}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Total Submissions: {transformedRegistrations.length}
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading results...</div>}>
        <ResultsTable initialRegistrations={transformedRegistrations} />
      </Suspense>
    </div>
  );
}
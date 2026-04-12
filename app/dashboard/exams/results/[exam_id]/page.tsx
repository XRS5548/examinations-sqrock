// app/dashboard/exams/results/[exam_id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { exams, examRegistrations, students } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserCompany } from "@/actions/company";
import { ResultsStats } from "./ResultsStats";
import { ResultsTable } from "./ResultsTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { publishResults } from "@/actions/results";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "./ExportButton";
import { PublishButton } from "./PublishButton";

interface PageProps {
  params: Promise<{ exam_id: string }>;
}

export default async function ResultsPage({ params }: PageProps) {
  const { exam_id } = await params;
  const examId = parseInt(exam_id);

  if (isNaN(examId)) {
    notFound();
  }

  const company = await getUserCompany();
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  // Fetch exam details
  const examList = await db.select()
    .from(exams)
    .where(eq(exams.id, examId))
    .limit(1);

  if (examList.length === 0) {
    notFound();
  }

  const exam = examList[0];

  // Verify exam belongs to company
  if (exam.companyId !== company.id) {
    notFound();
  }

  // Fetch all registrations with student details
  const registrationsRaw = await db.select({
    id: examRegistrations.id,
    examId: examRegistrations.examId,
    studentId: examRegistrations.studentId,
    rollNumber: examRegistrations.rollNumber,
    score: examRegistrations.score,
    cheating: examRegistrations.cheating,
    status: examRegistrations.status,
    startedAt: examRegistrations.startedAt,
    submittedAt: examRegistrations.submittedAt,
    studentName: students.name,
    studentEmail: students.email,
    studentDob: students.dob,
    studentPhone: students.phone,
  })
  .from(examRegistrations)
  .leftJoin(students, eq(examRegistrations.studentId, students.id))
  .where(eq(examRegistrations.examId, examId))
  .orderBy(desc(examRegistrations.score));

  // Transform data to match expected types
  const registrations = registrationsRaw.map(reg => ({
    id: reg.id,
    examId: reg.examId ?? 0,
    studentId: reg.studentId ?? 0,
    rollNumber: reg.rollNumber,
    score: reg.score ?? 0,
    cheating: reg.cheating ?? false,
    status: reg.status,
    startedAt: reg.startedAt,
    submittedAt: reg.submittedAt,
    studentName: reg.studentName,
    studentEmail: reg.studentEmail,
    studentDob: reg.studentDob ? new Date(reg.studentDob) : null, // Convert string to Date
    studentPhone: reg.studentPhone,
  }));

  const passingMarks = exam.totalMarks ? Math.ceil(exam.totalMarks * 0.4) : 0;

  const stats = {
    total: registrations.length,
    passed: registrations.filter(r => !r.cheating && (r.score || 0) >= passingMarks).length,
    failed: registrations.filter(r => !r.cheating && (r.score || 0) < passingMarks).length,
    cheating: registrations.filter(r => r.cheating).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/exams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
            <p className="text-muted-foreground mt-2">
              {exam.name} • {exam.totalMarks} total marks • Passing: {passingMarks} marks
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportButton examId={examId} />
          {!exam.resultAnnounced && registrations.length > 0 && (
            <PublishButton examId={examId} />
          )}
          {exam.resultAnnounced && (
            <Badge variant="default" className="bg-green-600">
              Results Published
            </Badge>
          )}
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading stats...</div>}>
        <ResultsStats stats={stats} totalMarks={exam.totalMarks || 0} />
      </Suspense>

      <Suspense fallback={<div className="text-center py-12">Loading results...</div>}>
        <ResultsTable
          examId={examId}
          registrations={registrations}
          passingMarks={passingMarks}
          totalMarks={exam.totalMarks || 0}
        />
      </Suspense>
    </div>
  );
}
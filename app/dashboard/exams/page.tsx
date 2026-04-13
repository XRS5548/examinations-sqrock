// app/dashboard/exams/page.tsx
import { Suspense } from "react";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { ExamsTable } from "@/pagecomponents/exams/ExamsTable"; 
import { CreateExamDialog } from "@/pagecomponents/exams/CreateExamDialog";
export const dynamic = 'force-dynamic';


export default async function ExamsPage() {
  const companyId = 1; // TODO: Get from session
  
  // Fetch exams from database
  const examsListRaw = await db.select()
    .from(exams)
    .where(and(eq(exams.companyId, companyId)))
    .orderBy(desc(exams.createdAt));

  // Transform data to match expected types (convert nulls to defaults)
  const examsList = examsListRaw.map(exam => ({
    id: exam.id,
    name: exam.name,
    description: exam.description,
    syllabusPdf: exam.syllabusPdf,
    coverImage: exam.coverImage,
    examDate: exam.examDate,
    durationMinutes: exam.durationMinutes,
    totalMarks: exam.totalMarks,
    isLive: exam.isLive ?? false, // Convert null to false
    resultAnnounced: exam.resultAnnounced ?? false, // Convert null to false
    createdAt: exam.createdAt,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground mt-2">
            Manage your exams, create new ones, and monitor their status.
          </p>
        </div>
        <CreateExamDialog />
      </div>

      <Suspense fallback={<div>Loading exams...</div>}>
        <ExamsTable initialExams={examsList} />
      </Suspense>
    </div>
  );
}
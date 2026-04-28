// app/dashboard/exams/page.tsx

import { getUserCompany } from "@/actions/company";
import { db } from "@/db";
import { exams } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { CreateExamDialog } from "@/pagecomponents/exams/CreateExamDialog";
import { ExamsTable } from "@/pagecomponents/exams/ExamsTable";
import { and, desc, eq } from "drizzle-orm";
import { Suspense } from "react";

export default async function ExamsPage() {
  // Get current user
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please login to view exams</p>
      </div>
    );
  }

  // Get user's company
  const company = await getUserCompany();
  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  const companyId = company.id;
  
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
    isLive: exam.isLive ?? false,
    isPublic: exam.isPublic ?? false,
    isClosed: exam.isClosed ?? false,  // ADD THIS LINE
    resultAnnounced: exam.resultAnnounced ?? false,
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
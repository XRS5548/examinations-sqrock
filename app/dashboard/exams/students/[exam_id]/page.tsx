// app/dashboard/exams/students/[exam_id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { exams, students, examRegistrations } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getUserCompany } from "@/actions/company";
import { StudentsSelectionTable } from "./StudentsSelectionTable";
import { AssignedStudentsTable } from "./AssignedStudentsTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ exam_id: string }>;
}

export default async function AssignStudentsPage({ params }: PageProps) {
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

  // Fetch all students of the company
  const allStudents = await db.select()
    .from(students)
    .where(eq(students.companyId, company.id))
    .orderBy(students.createdAt);

  // Fetch already assigned students
  const assignedRegistrationsRaw = await db.select()
    .from(examRegistrations)
    .where(eq(examRegistrations.examId, examId));

  const assignedStudentIds = assignedRegistrationsRaw.map(reg => reg.studentId).filter((id): id is number => id !== null);
  
  // Fetch assigned student details using inArray
  let assignedStudents: any[] = [];
  if (assignedStudentIds.length > 0) {
    assignedStudents = await db.select()
      .from(students)
      .where(inArray(students.id, assignedStudentIds));
  }

  // Transform assigned registrations to match expected types
  const assignedRegistrations = assignedRegistrationsRaw.map(reg => ({
    id: reg.id,
    examId: reg.examId ?? 0,
    studentId: reg.studentId ?? 0,
    rollNumber: reg.rollNumber,
    score: reg.score ?? 0,
    cheating: reg.cheating ?? false,
    status: reg.status,
    startedAt: reg.startedAt,
    submittedAt: reg.submittedAt,
    student: assignedStudents.find(s => s.id === reg.studentId),
  }));

  // Available students (not assigned) - transform dob from string to Date
  const availableStudents = allStudents
    .filter(s => !assignedStudentIds.includes(s.id))
    .map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      dob: student.dob ? new Date(student.dob) : null,
      createdAt: student.createdAt,
      companyId: student.companyId ?? 0,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/exams">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Students to Exam</h1>
          <p className="text-muted-foreground mt-2">
            {exam.name} • {assignedRegistrations.length} students assigned
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Students</h2>
            <Badge variant="outline">{availableStudents.length} students</Badge>
          </div>
          <Suspense fallback={<div className="text-center py-12">Loading students...</div>}>
            <StudentsSelectionTable
              examId={examId}
              students={availableStudents}
              companyPrefix={company.rollPrefix}
              companyInfix={company.rollInfix}
            />
          </Suspense>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Assigned Students</h2>
            <Badge variant="outline">{assignedRegistrations.length} assigned</Badge>
          </div>
          <Suspense fallback={<div className="text-center py-12">Loading assignments...</div>}>
            <AssignedStudentsTable
              examId={examId}
              initialAssignments={assignedRegistrations}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
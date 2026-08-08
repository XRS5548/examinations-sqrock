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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    domain: reg.domain, // ✅ ADD THIS
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

      <div className="space-y-4">
        <Tabs defaultValue="available" className="w-full">

          {/* Tabs */}
          <div className="px-1">
            <TabsList className="grid w-full grid-cols-2  ">
              <TabsTrigger
                value="available"
                className=""
              >
                Available Students ({availableStudents.length})
              </TabsTrigger>

              <TabsTrigger
                value="assigned"
                className=""
              >
                Assigned Students ({assignedRegistrations.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* AVAILABLE */}
          <TabsContent value="available" className="mt-5">
            <div className="rounded-xl border bg-card overflow-hidden">

              <div className="px-6 py-5 border-b">
                <h2 className="text-xl font-semibold">
                  Available Students
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Select students to assign them to this exam.
                </p>
              </div>

              <div className="p-4">
                <Suspense
                  fallback={
                    <div className="text-center py-12">
                      Loading students...
                    </div>
                  }
                >
                  <StudentsSelectionTable
                    examId={examId}
                    students={availableStudents}
                    companyPrefix={company.rollPrefix}
                    companyInfix={company.rollInfix}
                  />
                </Suspense>
              </div>

            </div>
          </TabsContent>

          {/* ASSIGNED */}
          <TabsContent value="assigned" className="mt-5">
            <div className="rounded-xl border bg-card overflow-hidden">

              <div className="px-6 py-5 border-b">
                <h2 className="text-xl font-semibold">
                  Assigned Students
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Students currently assigned to this exam.
                </p>
              </div>

              <div className="p-4">
                <Suspense
                  fallback={
                    <div className="text-center py-12">
                      Loading assignments...
                    </div>
                  }
                >
                  <AssignedStudentsTable
                    examId={examId}
                    initialAssignments={assignedRegistrations}
                  />
                </Suspense>
              </div>

            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
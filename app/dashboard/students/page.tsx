// app/dashboard/students/page.tsx
import { Suspense } from "react";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { StudentsTable } from "./StudentsTable"; 
import { AddStudentDialog } from "./AddStudentDialog";
import { getUserCompany } from "@/actions/company";
export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  const company = await getUserCompany();
  
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Please create a company first</p>
      </div>
    );
  }

  const studentsListRaw = await db.select()
    .from(students)
    .where(eq(students.companyId, company.id))
    .orderBy(desc(students.createdAt));

  // Transform data to match expected types
  const studentsList = studentsListRaw.map(student => ({
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    dob: student.dob ? new Date(student.dob) : null, // Convert string to Date
    createdAt: student.createdAt,
    companyId: student.companyId ?? 0, // Convert null to 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-2">
            Manage your students, add new ones, and track their progress.
          </p>
        </div>
        <AddStudentDialog />
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading students...</div>}>
        <StudentsTable initialStudents={studentsList} />
      </Suspense>
    </div>
  );
}
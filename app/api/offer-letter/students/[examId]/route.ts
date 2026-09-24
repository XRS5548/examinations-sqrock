// app/api/offer-letter/students/[examId]/route.ts
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "@/actions/company";
import { exams, examRegistrations, students } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { studentDb } from "@/db/student-db";
import { offerLetters } from "@/db/recoards";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const company = await getUserCompany();
    if (!company) {
      return new Response("No company found", { status: 404 });
    }

    const { examId } = await params;
    const examIdNum = Number(examId);

    if (!Number.isInteger(examIdNum) || examIdNum <= 0) {
      return new Response("Invalid exam", { status: 400 });
    }

    // Verify exam belongs to company
    const examList = await db.select()
      .from(exams)
      .where(and(eq(exams.id, examIdNum), eq(exams.companyId, company.id)))
      .limit(1);

    if (examList.length === 0) {
      return new Response("Exam not found", { status: 404 });
    }

    const exam = examList[0];

    if (!exam.resultAnnounced) {
      return new Response("Results are not announced yet", { status: 409 });
    }

    if (
      !exam.internshipStartDate ||
      !exam.internshipEndDate ||
      !exam.internshipDuration
    ) {
      return new Response("Exam internship schedule is not configured", {
        status: 409,
      });
    }

    // Get all registrations for this exam with student details
    const registrations = await db.select({
      id: examRegistrations.id,
      rollNumber: examRegistrations.rollNumber,
      score: examRegistrations.score,
      status: examRegistrations.status,
      cheating: examRegistrations.cheating,
      domain: examRegistrations.domain,
      universityName: examRegistrations.universityName,
      collegeName: examRegistrations.collegeName,
      course: examRegistrations.course,
      branch: examRegistrations.branch,
      semester: examRegistrations.semester,
      studentName: students.name,
      studentEmail: students.email,
    })
    .from(examRegistrations)
    .leftJoin(students, eq(examRegistrations.studentId, students.id))
    .where(eq(examRegistrations.examId, examIdNum));

    const rollNumbers = registrations.flatMap((registration) =>
      registration.rollNumber ? [registration.rollNumber] : []
    );
    const existingOffers = rollNumbers.length
      ? await studentDb.select({ employeeId: offerLetters.employeeId })
          .from(offerLetters)
          .where(inArray(offerLetters.employeeId, rollNumbers))
      : [];
    const existingEmployeeIds = new Set(
      existingOffers.map((offer) => offer.employeeId)
    );

    const passingScore = exam.passingScore ?? 60;

    const eligibleStudents = registrations
      .filter(
        (registration) =>
          registration.status === "completed" &&
          !registration.cheating &&
          registration.rollNumber &&
          registration.studentName &&
          registration.studentEmail &&
          (registration.score ?? 0) >= passingScore
      )
      .map(reg => ({
        id: reg.id,
        name: reg.studentName || "",
        email: reg.studentEmail || "",
        rollNumber: reg.rollNumber,
        score: reg.score ?? 0,
        examName: exam.name,
        domain: reg.domain,
        universityName: reg.universityName,
        collegeName: reg.collegeName,
        course: reg.course,
        branch: reg.branch,
        semester: reg.semester,
        hasOfferLetter: existingEmployeeIds.has(reg.rollNumber),
      }));

    return Response.json({
      students: eligibleStudents,
      internship: {
        startDate: exam.internshipStartDate,
        endDate: exam.internshipEndDate,
        duration: exam.internshipDuration,
      },
    });
  } catch (error) {
    console.error("Get students for offer letter error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
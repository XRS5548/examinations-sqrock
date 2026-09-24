import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "@/actions/company";
import { getOrCreateOfferLetter } from "@/actions/offer-letter";
import { db } from "@/db";
import { offerLetters } from "@/db/recoards";
import { studentDb } from "@/db/student-db";
import { examRegistrations, exams, students } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await getUserCompany();
    if (!company) {
      return Response.json({ error: "No company found" }, { status: 404 });
    }

    const body = await request.json();
    const examId = Number(body?.examId);
    if (!Number.isInteger(examId) || examId <= 0) {
      return Response.json({ error: "Invalid exam" }, { status: 400 });
    }

    const examList = await db
      .select()
      .from(exams)
      .where(and(eq(exams.id, examId), eq(exams.companyId, company.id)))
      .limit(1);

    if (examList.length === 0) {
      return Response.json({ error: "Exam not found" }, { status: 404 });
    }

    const exam = examList[0];
    if (!exam.resultAnnounced) {
      return Response.json(
        { error: "Announce exam results before generating offer letters" },
        { status: 409 }
      );
    }

    if (
      !exam.internshipStartDate ||
      !exam.internshipEndDate ||
      !exam.internshipDuration
    ) {
      return Response.json(
        { error: "Exam internship schedule is not configured" },
        { status: 409 }
      );
    }

    const registrations = await db
      .select({
        id: examRegistrations.id,
        rollNumber: examRegistrations.rollNumber,
        score: examRegistrations.score,
        status: examRegistrations.status,
        cheating: examRegistrations.cheating,
        studentName: students.name,
        studentEmail: students.email,
      })
      .from(examRegistrations)
      .leftJoin(students, eq(examRegistrations.studentId, students.id))
      .where(eq(examRegistrations.examId, examId));

    const passingScore = exam.passingScore ?? 60;
    const eligibleRegistrations = registrations.filter(
      (registration) =>
        registration.status === "completed" &&
        !registration.cheating &&
        registration.rollNumber &&
        registration.studentName &&
        registration.studentEmail &&
        (registration.score ?? 0) >= passingScore
    );

    const rollNumbers = eligibleRegistrations.flatMap((registration) =>
      registration.rollNumber ? [registration.rollNumber] : []
    );
    const existingOffers = rollNumbers.length
      ? await studentDb
          .select({ employeeId: offerLetters.employeeId })
          .from(offerLetters)
          .where(inArray(offerLetters.employeeId, rollNumbers))
      : [];
    const existingEmployeeIds = new Set(
      existingOffers.map((offer) => offer.employeeId)
    );
    const pendingRegistrations = eligibleRegistrations.filter(
      (registration) =>
        registration.rollNumber &&
        !existingEmployeeIds.has(registration.rollNumber)
    );

    let generated = 0;
    const failedRegistrationIds: number[] = [];

    for (const registration of pendingRegistrations) {
      try {
        await getOrCreateOfferLetter(registration.id);
        generated += 1;
      } catch {
        failedRegistrationIds.push(registration.id);
      }
    }

    return Response.json({
      success: failedRegistrationIds.length === 0,
      eligible: eligibleRegistrations.length,
      pending: pendingRegistrations.length,
      generated,
      failed: failedRegistrationIds.length,
      failedRegistrationIds,
    });
  } catch (error) {
    console.error("Generate all offer letters error:", error);
    return Response.json(
      { error: "Failed to generate offer letters" },
      { status: 500 }
    );
  }
}

// app/api/certificates/generate/route.ts
// ✅ GENERATE endpoint — email + examid
// Ye woh file hai jo pehle galat jagah thi

import { db } from "@/db";

import {
  examRegistrations,
  students,
  exams,
} from "@/db/schema";

import { and, eq } from "drizzle-orm";

import { NextRequest, NextResponse } from "next/server";

import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";

import { certificates } from "@/db/recoards";

import {
  sendCertificateSuccessEmail,
  sendCertificateFailureEmail,
} from "@/lib/emails";

/* =========================================================
   CERTIFICATE DATABASE
========================================================= */

const recoardsdb = drizzle(
  process.env.STUDENTCERTIFICATES_DATABASE_URL!
);

/* =========================================================
   TYPES
========================================================= */

interface BODY {
  examid: string;
  email: string;
}

type EmailStatus = "sent" | "failed" | "not_available";

/* =========================================================
   ALLOWED DOMAINS
========================================================= */

const domains = [
  "Web Development",
  "Data Science",
  "Python",
  "Java",
  "C++",
  "Android Development",
  "Frontend Development",
  "Backend Development",
  "UI/UX Design",
  "Cyber Security",
  "Digital Marketing",
];

/* =========================================================
   HELPERS
========================================================= */

function getPerformanceGrade(
  score: number,
  passingScore: number
): string {
  if (score >= Math.max(passingScore, 45)) return "Excellent";
  if (score >= Math.max(passingScore, 40)) return "Very Good";
  if (score >= Math.max(passingScore, 35)) return "Good";
  if (score >= passingScore) return "Satisfactory";
  return "Needs Improvement";
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/* =========================================================
   API
========================================================= */

export async function GET(request: NextRequest) {
  try {
    /* =====================================================
       1. GET QUERY PARAMETERS
    ===================================================== */

    const body: BODY = {
      email:
        request.nextUrl.searchParams
          .get("email")
          ?.trim()
          .toLowerCase() || "",

      examid:
        request.nextUrl.searchParams
          .get("examid")
          ?.trim() || "",
    };

    /* =====================================================
       2. BASIC VALIDATION
    ===================================================== */

    if (!body.email || !body.examid) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "email and examid are required",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       3. VALIDATE EXAM ID
    ===================================================== */

    const examId = Number(body.examid);

    if (!Number.isInteger(examId) || examId <= 0) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "invalid examid",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       4. FIND EXAM
    ===================================================== */

    const examResult = await db
      .select({
        id: exams.id,
        companyId: exams.companyId,
        name: exams.name,
        passingScore: exams.passingScore,
        totalMarks: exams.totalMarks,
        internshipStartDate: exams.internshipStartDate,
        internshipEndDate: exams.internshipEndDate,
        internshipDuration: exams.internshipDuration,
      })
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (examResult.length === 0) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "exam doesn't exist",
        },
        { status: 404 }
      );
    }

    const examData = examResult[0];

    if (
      !examData.internshipStartDate ||
      !examData.internshipEndDate ||
      !examData.internshipDuration
    ) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "exam internship schedule is not configured",
        },
        { status: 409 }
      );
    }

    /* =====================================================
       5. FIND STUDENT
    ===================================================== */

    const studentResult = await db
      .select({
        id: students.id,
        companyId: students.companyId,
        name: students.name,
        email: students.email,
        phone: students.phone,
      })
      .from(students)
      .where(eq(students.email, body.email))
      .limit(1);

    if (studentResult.length === 0) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "student email doesn't exist in database",
        },
        { status: 404 }
      );
    }

    const studentData = studentResult[0];

    /* =====================================================
       6. VALIDATE STUDENT NAME
    ===================================================== */

    if (!studentData.name?.trim()) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "student name is missing",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       7. VALIDATE COMPANY
    ===================================================== */

    if (
      studentData.companyId &&
      examData.companyId &&
      studentData.companyId !== examData.companyId
    ) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "student does not belong to this exam's company",
        },
        { status: 403 }
      );
    }

    /* =====================================================
       8. FIND EXAM REGISTRATION
    ===================================================== */

    const registrationResult = await db
      .select()
      .from(examRegistrations)
      .where(
        and(
          eq(examRegistrations.studentId, studentData.id),
          eq(examRegistrations.examId, examId)
        )
      )
      .limit(1);

    if (registrationResult.length === 0) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "student is not registered for this exam",
        },
        { status: 404 }
      );
    }

    const registration = registrationResult[0];

    /* =====================================================
       9. CHECK EXAM COMPLETION
    ===================================================== */

    if (registration.status !== "completed") {
      const reason = `Your certificate could not be generated because your examination is not completed. Current exam status: ${registration.status}.`;

      if (studentData.email) {
        try {
          await sendCertificateFailureEmail({
            email: studentData.email,
            name: studentData.name.trim(),
            reason,
          });
        } catch (emailError) {
          console.error("Failure email error:", emailError);
        }
      }

      return NextResponse.json(
        {
          result: "fail",
          reason: "exam is not completed yet",
          status: registration.status,
        },
        { status: 400 }
      );
    }

    /* =====================================================
       10. CHEATING CHECK
    ===================================================== */

    if (registration.cheating === true) {
      const reason =
        "Your certificate could not be generated because cheating or an examination integrity violation was detected during your examination.";

      if (studentData.email) {
        try {
          await sendCertificateFailureEmail({
            email: studentData.email,
            name: studentData.name.trim(),
            reason,
          });
        } catch (emailError) {
          console.error("Failure email error:", emailError);
        }
      }

      return NextResponse.json(
        {
          result: "fail",
          reason:
            "certificate cannot be generated because cheating was detected",
        },
        { status: 403 }
      );
    }

    /* =====================================================
       11. DOMAIN
    ===================================================== */

    const domain = registration.domain?.trim() || "Web Development";

    if (!domains.includes(domain)) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "invalid internship domain",
          domain,
        },
        { status: 400 }
      );
    }

    /* =====================================================
       12. SCORE
    ===================================================== */

    const score = registration.score ?? 0;
    const passingScore = examData.passingScore ?? 60;

    /* =====================================================
       13. CHECK PASSING SCORE
    ===================================================== */

    if (score < passingScore) {
      const reason = `You did not achieve the required passing score for the examination. Your score was ${score}/${
        examData.totalMarks ?? "N/A"
      }, while the minimum passing score was ${passingScore}.`;

      if (studentData.email) {
        try {
          await sendCertificateFailureEmail({
            email: studentData.email,
            name: studentData.name.trim(),
            reason,
          });
        } catch (emailError) {
          console.error("Failure email error:", emailError);
        }
      }

      return NextResponse.json(
        {
          result: "fail",
          reason: "student did not achieve the passing score",
          score,
          totalMarks: examData.totalMarks,
          passingScore,
        },
        { status: 400 }
      );
    }

    /* =====================================================
       14. PERFORMANCE GRADE
    ===================================================== */

    const performanceGrade = getPerformanceGrade(score, passingScore);

    /* =====================================================
       15. EMPLOYEE ID
    ===================================================== */

    const employeeId = `SQ-INT-${String(studentData.id).padStart(5, "0")}`;

    /* =====================================================
       16. CERTIFICATE VERIFICATION CODE
    ===================================================== */

    const verificationCode = `SQ-CERT-${new Date().getFullYear()}-${String(
      registration.id
    ).padStart(5, "0")}`;

    /* =====================================================
       17. CHECK EXISTING CERTIFICATE
    ===================================================== */

    const existingCertificate = await recoardsdb
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.examid, String(examId)),
          eq(certificates.employeeId, employeeId)
        )
      )
      .limit(1);

    /* =====================================================
       18. CERTIFICATE ALREADY EXISTS
    ===================================================== */

    if (existingCertificate.length > 0) {
      return NextResponse.json({
        result: "success",
        message: "certificate already exists",
        email: existingCertificate[0].emailStatus,
        certificate: existingCertificate[0],
      });
    }

    /* =====================================================
       19. INTERNSHIP DATES
    ===================================================== */

    const startDate = examData.internshipStartDate;
    const endDate = examData.internshipEndDate;
    const duration = examData.internshipDuration;

    /* =====================================================
       20. DEPARTMENT
    ===================================================== */

    let department = domain;

    if (
      domain === "Web Development" ||
      domain === "Frontend Development" ||
      domain === "Backend Development"
    ) {
      department = "Software Development";
    }

    /* =====================================================
       21. ISSUE DATE
    ===================================================== */

    const issueDate = formatDate(new Date());

    /* =====================================================
       22. CERTIFICATE DATA
    ===================================================== */

    const certificateData = {
      examid: String(examId),

      verificationCode,

      employeeId,

      name: studentData.name.trim(),

      email: studentData.email,

      phone: studentData.phone,

      designation: `${domain} Intern`,

      department,

      internshipType: "Industrial Training",

      startDate,

      endDate,

      // ✅ Computed — not hardcoded "1 Month"
      duration,

      performanceGrade,

      issueDate,

      emailStatus: "not_available" as EmailStatus,

      certificateUrl: null,

      // ✅ Education from registration
      universityName: registration.universityName || null,
      collegeName: registration.collegeName || null,
      course: registration.course || null,
      branch: registration.branch || null,
      semester: registration.semester || null,
      enrollmentNumber: registration.enrollmentNumber || null,

      projectName: null,
      technologies: null,
      skills: null,
    };

    /* =====================================================
       23. SAVE CERTIFICATE
    ===================================================== */

    const inserted = await recoardsdb
      .insert(certificates)
      .values(certificateData)
      .returning();

    const savedCertificate = inserted[0];

    /* =====================================================
       24. SEND SUCCESS EMAIL
    ===================================================== */

    let emailStatus: EmailStatus = "not_available";

    if (studentData.email) {
      try {
        const emailResult = await sendCertificateSuccessEmail({
          email: studentData.email,
          name: studentData.name.trim(),
          certificateId: savedCertificate.verificationCode,
          employeeId: savedCertificate.employeeId,
          designation: savedCertificate.designation,
          internshipType:
            savedCertificate.internshipType || "Industrial Training",
          startDate: savedCertificate.startDate,
          endDate: savedCertificate.endDate,
          performanceGrade: savedCertificate.performanceGrade || "N/A",
        });

        if (emailResult.error) {
          emailStatus = "failed";
          console.error("Certificate email failed:", emailResult.error);
        } else {
          emailStatus = "sent";
        }
      } catch (emailError) {
        emailStatus = "failed";
        console.error("Certificate email error:", emailError);
      }
    } else {
      emailStatus = "not_available";
    }

    /* =====================================================
       25. UPDATE EMAIL STATUS
    ===================================================== */

    const updatedCertificate = await recoardsdb
      .update(certificates)
      .set({ emailStatus })
      .where(eq(certificates.id, savedCertificate.id))
      .returning();

    const finalCertificate = updatedCertificate[0] ?? savedCertificate;

    /* =====================================================
       26. FINAL RESPONSE
    ===================================================== */

    return NextResponse.json({
      result: "success",
      message: "certificate generated and saved successfully",
      email: emailStatus,
      certificate: finalCertificate,
      student: {
        id: studentData.id,
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
      },
      exam: {
        id: examData.id,
        name: examData.name,
        domain,
        score,
        totalMarks: examData.totalMarks,
        passingScore,
        performanceGrade,
        registrationId: registration.id,
        rollNumber: registration.rollNumber,
      },
    });
  } catch (error) {
    /* =====================================================
       GLOBAL ERROR
    ===================================================== */

    console.error("Certificate Generate API Error:", error);

    return NextResponse.json(
      {
        result: "fail",
        reason: "internal server error",
        error: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 }
    );
  }
}
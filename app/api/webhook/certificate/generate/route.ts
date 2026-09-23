import { db } from "@/db";

import {
  examRegistrations,
  students,
  exams,
} from "@/db/schema";

import { and, eq } from "drizzle-orm";

import {
  NextRequest,
  NextResponse,
} from "next/server";

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

export const recoardsdb = drizzle(
  process.env.STUDENTCERTIFICATES_DATABASE_URL!
);

/* =========================================================
   TYPES
========================================================= */

interface BODY {
  examid: string;
  email: string;
}

type EmailStatus =
  | "sent"
  | "failed"
  | "not_available";

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
   STRING HELPER
========================================================= */

function cleanString(
  value: string | null | undefined
): string | null {
  const cleaned = value?.trim();

  return cleaned || null;
}

/* =========================================================
   DATE HELPERS
========================================================= */

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseDate(
  value:
    | string
    | Date
    | null
    | undefined
): Date | null {
  if (!value) return null;

  const date =
    value instanceof Date
      ? new Date(value)
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/* =========================================================
   CALCULATE END DATE FROM DURATION

   Supports:

   1 Month
   2 Months
   3 month
   4 Weeks
   6 weeks
   30 Days
   45 days
   1 Year

========================================================= */

function calculateEndDate(
  startDate: Date,
  duration: string
): Date {
  const result = new Date(startDate);

  const normalized =
    duration
      .trim()
      .toLowerCase();

  const match =
    normalized.match(
      /(\d+)\s*(day|days|week|weeks|month|months|year|years)/
    );

  if (!match) {
    // Safe fallback
    result.setMonth(
      result.getMonth() + 1
    );

    return result;
  }

  const amount =
    Number(match[1]);

  const unit =
    match[2];

  if (
    unit === "day" ||
    unit === "days"
  ) {
    result.setDate(
      result.getDate() + amount
    );
  }

  if (
    unit === "week" ||
    unit === "weeks"
  ) {
    result.setDate(
      result.getDate() +
        amount * 7
    );
  }

  if (
    unit === "month" ||
    unit === "months"
  ) {
    result.setMonth(
      result.getMonth() +
        amount
    );
  }

  if (
    unit === "year" ||
    unit === "years"
  ) {
    result.setFullYear(
      result.getFullYear() +
        amount
    );
  }

  return result;
}

/* =========================================================
   PERFORMANCE GRADE
========================================================= */

function getPerformanceGrade(
  score: number,
  totalMarks: number,
  passingScore: number
): string {
  if (
    score < passingScore
  ) {
    return "Needs Improvement";
  }

  if (
    totalMarks <= 0
  ) {
    return "Satisfactory";
  }

  const percentage =
    (score / totalMarks) * 100;

  if (
    percentage >= 90
  ) {
    return "Excellent";
  }

  if (
    percentage >= 75
  ) {
    return "Very Good";
  }

  if (
    percentage >= 60
  ) {
    return "Good";
  }

  return "Satisfactory";
}

/* =========================================================
   DEPARTMENT
========================================================= */

function getDepartment(
  domain: string
): string {
  switch (domain) {
    case "Web Development":
    case "Frontend Development":
    case "Backend Development":
      return "Software Development";

    case "Android Development":
      return "Mobile Development";

    case "Data Science":
      return "Data Science";

    case "Cyber Security":
      return "Cyber Security";

    case "UI/UX Design":
      return "Design";

    case "Digital Marketing":
      return "Marketing";

    case "Python":
    case "Java":
    case "C++":
      return "Software Development";

    default:
      return domain;
  }
}

/* =========================================================
   API
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    /* =====================================================
       1. QUERY PARAMS
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
       2. VALIDATION
    ===================================================== */

    if (
      !body.email ||
      !body.examid
    ) {
      return NextResponse.json(
        {
          result: "fail",
          reason:
            "email and examid are required",
        },
        {
          status: 400,
        }
      );
    }

    const examId =
      Number(body.examid);

    if (
      !Number.isInteger(
        examId
      ) ||
      examId <= 0
    ) {
      return NextResponse.json(
        {
          result: "fail",
          reason:
            "invalid examid",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       3. FIND EXAM
    ===================================================== */

    const examResult =
      await db
        .select({
          id: exams.id,
          companyId:
            exams.companyId,

          name:
            exams.name,

          examDate:
            exams.examDate,

          passingScore:
            exams.passingScore,

          totalMarks:
            exams.totalMarks,
        })
        .from(exams)
        .where(
          eq(
            exams.id,
            examId
          )
        )
        .limit(1);

    if (
      examResult.length === 0
    ) {
      return NextResponse.json(
        {
          result: "fail",
          reason:
            "exam doesn't exist",
        },
        {
          status: 404,
        }
      );
    }

    const examData =
      examResult[0];

    /* =====================================================
       4. FIND STUDENT

       IMPORTANT:
       Same email can theoretically exist
       under another company.

       So companyId is included when available.
    ===================================================== */

    const studentWhere =
      examData.companyId !== null &&
      examData.companyId !== undefined
        ? and(
            eq(
              students.email,
              body.email
            ),
            eq(
              students.companyId,
              examData.companyId
            )
          )
        : eq(
            students.email,
            body.email
          );

    const studentResult =
      await db
        .select({
          id:
            students.id,

          companyId:
            students.companyId,

          name:
            students.name,

          email:
            students.email,

          phone:
            students.phone,

          dob:
            students.dob,
        })
        .from(students)
        .where(studentWhere)
        .limit(1);

    if (
      studentResult.length === 0
    ) {
      return NextResponse.json(
        {
          result: "fail",
          reason:
            "student email doesn't exist for this exam/company",
        },
        {
          status: 404,
        }
      );
    }

    const studentData =
      studentResult[0];

    if (
      !studentData.name?.trim()
    ) {
      return NextResponse.json(
        {
          result: "fail",
          reason:
            "student name is missing",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       5. REGISTRATION

       THIS IS THE MAIN SOURCE OF:
       - domain
       - education
       - preferred start date
       - preferred duration
       - enrollment
       - semester
    ===================================================== */

    const registrationResult =
      await db
        .select()
        .from(
          examRegistrations
        )
        .where(
          and(
            eq(
              examRegistrations.studentId,
              studentData.id
            ),

            eq(
              examRegistrations.examId,
              examId
            )
          )
        )
        .limit(1);

    if (
      registrationResult.length === 0
    ) {
      return NextResponse.json(
        {
          result: "fail",
          reason:
            "student is not registered for this exam",
        },
        {
          status: 404,
        }
      );
    }

    const registration =
      registrationResult[0];

    /* =====================================================
       6. EXAM STATUS
    ===================================================== */

    if (
      registration.status !==
      "completed"
    ) {
      const reason =
        `Your certificate could not be generated because your examination is not completed. Current exam status: ${registration.status}.`;

      if (
        studentData.email
      ) {
        try {
          await sendCertificateFailureEmail(
            {
              email:
                studentData.email,

              name:
                studentData.name.trim(),

              reason,
            }
          );
        } catch (
          emailError
        ) {
          console.error(
            "Failure email error:",
            emailError
          );
        }
      }

      return NextResponse.json(
        {
          result: "fail",

          reason:
            "exam is not completed yet",

          status:
            registration.status,
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       7. CHEATING
    ===================================================== */

    if (
      registration.cheating ===
      true
    ) {
      const reason =
        "Your certificate could not be generated because cheating or an examination integrity violation was detected during your examination.";

      if (
        studentData.email
      ) {
        try {
          await sendCertificateFailureEmail(
            {
              email:
                studentData.email,

              name:
                studentData.name.trim(),

              reason,
            }
          );
        } catch (
          emailError
        ) {
          console.error(
            "Failure email error:",
            emailError
          );
        }
      }

      return NextResponse.json(
        {
          result: "fail",

          reason:
            "certificate cannot be generated because cheating was detected",
        },
        {
          status: 403,
        }
      );
    }

    /* =====================================================
       8. DOMAIN
    ===================================================== */

    const domain =
      registration.domain?.trim();

    if (!domain) {
      return NextResponse.json(
        {
          result: "fail",

          reason:
            "internship domain is missing from registration",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !domains.includes(
        domain
      )
    ) {
      return NextResponse.json(
        {
          result: "fail",

          reason:
            "invalid internship domain",

          domain,
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       9. SCORE
    ===================================================== */

    const score =
      registration.score ??
      0;

    const totalMarks =
      examData.totalMarks ??
      0;

    const passingScore =
      examData.passingScore ??
      0;

    if (
      score < passingScore
    ) {
      const reason =
        `You did not achieve the required passing score for the examination. Your score was ${score}/${totalMarks || "N/A"}, while the minimum passing score was ${passingScore}.`;

      if (
        studentData.email
      ) {
        try {
          await sendCertificateFailureEmail(
            {
              email:
                studentData.email,

              name:
                studentData.name.trim(),

              reason,
            }
          );
        } catch (
          emailError
        ) {
          console.error(
            "Failure email error:",
            emailError
          );
        }
      }

      return NextResponse.json(
        {
          result: "fail",

          reason:
            "student did not achieve the passing score",

          score,

          totalMarks,

          passingScore,
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       10. PERFORMANCE
    ===================================================== */

    const performanceGrade =
      getPerformanceGrade(
        score,
        totalMarks,
        passingScore
      );

    /* =====================================================
       11. IDs
    ===================================================== */

    const employeeId =
      `SQ-INT-${String(
        studentData.id
      ).padStart(
        5,
        "0"
      )}`;

    const verificationCode =
      `SQ-CERT-${new Date().getFullYear()}-${String(
        registration.id
      ).padStart(
        5,
        "0"
      )}`;

    /* =====================================================
       12. EDUCATION DATA

       Registration is source of truth
    ===================================================== */

    const universityName =
      cleanString(
        registration.universityName
      );

    const collegeName =
      cleanString(
        registration.collegeName
      );

    const course =
      cleanString(
        registration.course
      );

    const branch =
      cleanString(
        registration.branch
      );

    const semester =
      cleanString(
        registration.semester
      );

    const enrollmentNumber =
      cleanString(
        registration.enrollmentNumber
      );

    /* =====================================================
       13. INTERNSHIP DURATION

       No longer hard-coded.
    ===================================================== */

    const preferredDuration =
      cleanString(
        registration.preferredDuration
      );

    const duration =
      preferredDuration ||
      "1 Month";

    /* =====================================================
       14. START DATE

       Priority:
       1. preferredStartDate
       2. submittedAt
       3. exam date
       4. current date
    ===================================================== */

    const internshipStart =
      parseDate(
        registration.preferredStartDate
      ) ??
      parseDate(
        registration.submittedAt
      ) ??
      parseDate(
        examData.examDate
      ) ??
      new Date();

    /* =====================================================
       15. END DATE

       Automatically calculated from duration.
    ===================================================== */

    const internshipEnd =
      calculateEndDate(
        internshipStart,
        duration
      );

    const startDate =
      formatDate(
        internshipStart
      );

    const endDate =
      formatDate(
        internshipEnd
      );

    /* =====================================================
       16. DEPARTMENT / DESIGNATION
    ===================================================== */

    const department =
      getDepartment(
        domain
      );

    const designation =
      `${domain} Intern`;

    const internshipType =
      "Industrial Training";

    const issueDate =
      formatDate(
        new Date()
      );

    /* =====================================================
       17. CHECK EXISTING CERTIFICATE
    ===================================================== */

    const existingCertificate =
      await recoardsdb
        .select()
        .from(certificates)
        .where(
          and(
            eq(
              certificates.examid,
              String(examId)
            ),

            eq(
              certificates.employeeId,
              employeeId
            )
          )
        )
        .limit(1);

    /* =====================================================
       18. EXISTING CERTIFICATE

       IMPORTANT:
       Old API simply returned stale certificate.

       Now we update all source-based fields first.
    ===================================================== */

    if (
      existingCertificate.length >
      0
    ) {
      const existing =
        existingCertificate[0];

      const updated =
        await recoardsdb
          .update(certificates)
          .set({
            name:
              studentData.name.trim(),

            email:
              studentData.email,

            phone:
              studentData.phone,

            designation,

            department,

            internshipType,

            startDate,

            endDate,

            duration,

            performanceGrade,

            universityName,

            collegeName,

            course,

            branch,

            semester,

            enrollmentNumber,

            issueDate:
              existing.issueDate ||
              issueDate,
          })
          .where(
            eq(
              certificates.id,
              existing.id
            )
          )
          .returning();

      return NextResponse.json(
        {
          result:
            "success",

          message:
            "certificate already existed and its data was synchronized successfully",

          email:
            updated[0]
              ?.emailStatus ??
            existing.emailStatus,

          certificate:
            updated[0] ??
            existing,

          student: {
            id:
              studentData.id,

            name:
              studentData.name,

            email:
              studentData.email,

            phone:
              studentData.phone,
          },

          education: {
            universityName,

            collegeName,

            course,

            branch,

            semester,

            enrollmentNumber,

            graduationYear:
              registration.graduationYear,
          },

          internship: {
            domain,

            designation,

            department,

            internshipType,

            startDate,

            endDate,

            duration,
          },

          exam: {
            id:
              examData.id,

            name:
              examData.name,

            score,

            totalMarks,

            passingScore,

            performanceGrade,

            registrationId:
              registration.id,

            rollNumber:
              registration.rollNumber,
          },
        }
      );
    }

    /* =====================================================
       19. NEW CERTIFICATE DATA
    ===================================================== */

    const certificateData = {
      examid:
        String(examId),

      verificationCode,

      employeeId,

      name:
        studentData.name.trim(),

      email:
        studentData.email,

      phone:
        studentData.phone,

      designation,

      department,

      internshipType,

      startDate,

      endDate,

      duration,

      performanceGrade,

      /* ==============================
         EDUCATION
      ============================== */

      universityName,

      collegeName,

      course,

      branch,

      semester,

      enrollmentNumber,

      /* ============================== */

      issueDate,

      emailStatus:
        "not_available" as EmailStatus,

      certificateUrl:
        null,
    };

    /* =====================================================
       20. INSERT
    ===================================================== */

    const inserted =
      await recoardsdb
        .insert(certificates)
        .values(
          certificateData
        )
        .returning();

    const savedCertificate =
      inserted[0];

    if (!savedCertificate) {
      throw new Error(
        "certificate could not be saved"
      );
    }

    /* =====================================================
       21. SEND SUCCESS EMAIL
    ===================================================== */

    let emailStatus:
      EmailStatus =
      "not_available";

    if (
      studentData.email
    ) {
      try {
        const emailResult =
          await sendCertificateSuccessEmail(
            {
              email:
                studentData.email,

              name:
                studentData.name.trim(),

              certificateId:
                savedCertificate.verificationCode,

              employeeId:
                savedCertificate.employeeId,

              designation:
                savedCertificate.designation,

              internshipType:
                savedCertificate.internshipType ||
                "Industrial Training",

              startDate:
                savedCertificate.startDate,

              endDate:
                savedCertificate.endDate,

              performanceGrade:
                savedCertificate.performanceGrade ||
                "N/A",
            }
          );

        if (
          emailResult.error
        ) {
          emailStatus =
            "failed";

          console.error(
            "Certificate email failed:",
            emailResult.error
          );
        } else {
          emailStatus =
            "sent";
        }
      } catch (
        emailError
      ) {
        emailStatus =
          "failed";

        console.error(
          "Certificate email error:",
          emailError
        );
      }
    }

    /* =====================================================
       22. EMAIL STATUS
    ===================================================== */

    const updatedCertificate =
      await recoardsdb
        .update(certificates)
        .set({
          emailStatus,
        })
        .where(
          eq(
            certificates.id,
            savedCertificate.id
          )
        )
        .returning();

    const finalCertificate =
      updatedCertificate[0] ??
      savedCertificate;

    /* =====================================================
       23. FINAL RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        result:
          "success",

        message:
          "certificate generated and saved successfully",

        email:
          emailStatus,

        certificate:
          finalCertificate,

        student: {
          id:
            studentData.id,

          name:
            studentData.name,

          email:
            studentData.email,

          phone:
            studentData.phone,
        },

        education: {
          universityName,

          collegeName,

          course,

          branch,

          semester,

          enrollmentNumber,

          graduationYear:
            registration.graduationYear,
        },

        internship: {
          domain,

          designation,

          department,

          internshipType,

          startDate,

          endDate,

          duration,

          preferredStartDate:
            registration.preferredStartDate,

          preferredDuration:
            registration.preferredDuration,
        },

        exam: {
          id:
            examData.id,

          name:
            examData.name,

          domain,

          score,

          totalMarks,

          passingScore,

          performanceGrade,

          registrationId:
            registration.id,

          rollNumber:
            registration.rollNumber,
        },
      }
    );
  } catch (error) {
    console.error(
      "Certificate API Error:",
      error
    );

    return NextResponse.json(
      {
        result:
          "fail",

        reason:
          "internal server error",

        error:
          error instanceof Error
            ? error.message
            : "unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
// app/api/certificates/route.ts
// ✅ VERIFY endpoint — email + certificateId
// Ye page.tsx isko call karta hai

import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";

import { certificates } from "@/db/recoards";
import { computeDuration } from "@/lib/certificate-utils";

// =====================================================
// DB connection
// =====================================================
export const recoardsdb = drizzle(
  process.env.STUDENTCERTIFICATES_DATABASE_URL!
);

// =====================================================
// GET /api/certificates?email=X&certificateId=Y
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const email = searchParams.get("email")?.trim().toLowerCase();
    const certificateId = searchParams
      .get("certificateId")
      ?.trim()
      .toUpperCase();

    if (!email || !certificateId) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "Email and certificate ID are required",
        },
        { status: 400 }
      );
    }

    const result = await recoardsdb
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.verificationCode, certificateId),
          eq(certificates.email, email)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          result: "fail",
          reason: "Certificate not found or email does not match",
        },
        { status: 404 }
      );
    }

    const cert = result[0];

    // ✅ Compute duration from actual dates (single source of truth)
    const computedDuration = computeDuration(cert.startDate, cert.endDate);

    return NextResponse.json({
      result: "success",
      message: "Certificate verified successfully",
      certificate: {
        id: cert.id,
        examid: cert.examid,
        verificationCode: cert.verificationCode,
        employeeId: cert.employeeId,
        name: cert.name,
        email: cert.email,
        phone: cert.phone,

        designation: cert.designation,
        department: cert.department,
        internshipType: cert.internshipType,

        startDate: cert.startDate,
        endDate: cert.endDate,

        // ✅ Always computed — never trust stored duration
        duration: computedDuration,

        performanceGrade: cert.performanceGrade,
        issueDate: cert.issueDate,
        certificateUrl: cert.certificateUrl,
        createdAt: cert.createdAt,

        universityName: cert.universityName,
        collegeName: cert.collegeName,
        course: cert.course,
        branch: cert.branch,
        semester: cert.semester,
        enrollmentNumber: cert.enrollmentNumber,

        projectName: cert.projectName,

        technologies: Array.isArray(cert.technologies)
          ? (cert.technologies as string[])
          : null,

        skills: Array.isArray(cert.skills)
          ? (cert.skills as string[])
          : null,
      },
    });
  } catch (error) {
    console.error("Certificate Verify API Error:", error);

    return NextResponse.json(
      {
        result: "fail",
        reason: "Internal server error",
      },
      { status: 500 }
    );
  }
}
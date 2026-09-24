// app/api/offer-letter/download/[offerLetterId]/route.ts
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "@/actions/company";
import { offerLetters } from "@/db/recoards";
import { exams, examRegistrations } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { studentDb } from "@/db/student-db";
import { createElement } from "react";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { renderToStream } from "@react-pdf/renderer";
import InternshipOfferLetterPDF, { InternshipOfferLetterData } from "@/docs/InternshipOfferLetterPDF";

function asStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ offerLetterId: string }> }
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

    const { offerLetterId } = await params;

    const letter = await studentDb
      .select()
      .from(offerLetters)
      .where(eq(offerLetters.offerLetterId, offerLetterId))
      .limit(1);

    if (letter.length === 0) {
      return new Response("Offer letter not found", { status: 404 });
    }

    const offerLetter = letter[0];

    if (!offerLetter.employeeId) {
      return new Response("Unauthorized", { status: 403 });
    }

    const registration = await db
      .select({ examId: exams.id })
      .from(examRegistrations)
      .innerJoin(exams, eq(examRegistrations.examId, exams.id))
      .where(
        and(
          eq(examRegistrations.rollNumber, offerLetter.employeeId),
          eq(exams.companyId, company.id)
        )
      )
      .limit(1);

    const actualExamId = registration[0]
      ? String(registration[0].examId)
      : null;
    if (!actualExamId) {
      return new Response("Unauthorized", { status: 403 });
    }

    if (offerLetter.examid !== actualExamId) {
      const [updatedOffer] = await studentDb
        .update(offerLetters)
        .set({ examid: actualExamId })
        .where(eq(offerLetters.id, offerLetter.id))
        .returning();
      offerLetter.examid = updatedOffer?.examid || actualExamId;
    }

    const [signatureImage, stampImage] = await Promise.all([
      readFile(join(process.cwd(), "public", "rohit.png")),
      readFile(join(process.cwd(), "public", "stamp.png")),
    ]);
    const signatureData = `data:image/png;base64,${signatureImage.toString("base64")}`;
    const stampData = `data:image/png;base64,${stampImage.toString("base64")}`;

    // Transform data for PDF
    const pdfData: InternshipOfferLetterData = {
      offerLetterId: offerLetter.offerLetterId,
      issueDate: offerLetter.issueDate,
      companyName: company.name,
      companyAddress: company.website || "SQROCK Cloud",
      companyEmail: "support@sqrock.cloud",
      companyWebsite: "https://sqrock.cloud",
      name: offerLetter.name,
      employeeEmail: offerLetter.email || "",
      phone: offerLetter.phone || undefined,
      universityName: offerLetter.universityName || undefined,
      course: offerLetter.course || undefined,
      branch: offerLetter.branch || undefined,
      semester: offerLetter.semester || undefined,
      designation: offerLetter.designation,
      department: offerLetter.department || undefined,
      internshipType: offerLetter.internshipType || undefined,
      mode: (offerLetter.workMode as "remote" | "hybrid" | "onsite") || "remote",
      startDate: offerLetter.startDate,
      endDate: offerLetter.endDate || offerLetter.startDate,
      duration: offerLetter.duration || undefined,
      reportingManager: offerLetter.reportingManager || undefined,
      reportingManagerDesignation: offerLetter.reportingManagerDesignation || undefined,
      reportingManagerEmail: offerLetter.reportingManagerEmail || undefined,
      isPaid: offerLetter.stipend !== "Unpaid",
      stipend: offerLetter.stipend === "Unpaid" ? undefined : parseFloat(offerLetter.stipend || "0"),
      currency: "INR",
      workingHours: offerLetter.workHours || "8 hours per day",
      workingDays: {
        sunday: false,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
      },
      shiftStartTime: offerLetter.shiftStartTime || undefined,
      shiftEndTime: offerLetter.shiftEndTime || undefined,
      breakDuration: offerLetter.breakDuration || undefined,
      weeklyHours: offerLetter.weeklyHours || undefined,
      responsibilities: asStringArray(offerLetter.responsibilities),
      learningObjectives: asStringArray(offerLetter.learningObjectives),
      technologies: asStringArray(offerLetter.technologies),
      minimumAttendancePercentage: offerLetter.minimumAttendance || undefined,
      allowedLeaves: offerLetter.allowedLeaves || undefined,
      leavePolicy: offerLetter.leavePolicy || undefined,
      noticePeriod: offerLetter.noticePeriod || undefined,
      terminationPolicy: offerLetter.terminationPolicy || undefined,
      codeOfConduct: offerLetter.codeOfConduct || undefined,
      confidentialityClause: offerLetter.confidentialityClause || undefined,
      intellectualPropertyClause: offerLetter.intellectualPropertyClause || undefined,
      performanceReview: offerLetter.performanceReview || undefined,
      completionCriteria: offerLetter.completionCriteria || undefined,
      certificateEligibility: offerLetter.certificateEligibility || undefined,
      companyAssetsProvided: asStringArray(offerLetter.companyAssets),
      termsAndConditions: asStringArray(offerLetter.termsAndConditions),
      hrName: offerLetter.hrName || undefined,
      hrDesignation: offerLetter.hrDesignation || undefined,
      hrEmail: offerLetter.hrEmail || undefined,
      hrPhone: offerLetter.hrPhone || undefined,
      authorizedPersonName: offerLetter.authorizedPersonName || "Rohit Verma",
      authorizedPersonDesignation: offerLetter.authorizedPersonDesignation || "Director",
      authorizedSignature: signatureData,
      companyStamp: stampData,
    };

    // Generate PDF
    const pdfDocument = createElement(
      InternshipOfferLetterPDF,
      { data: pdfData }
    ) as unknown as Parameters<typeof renderToStream>[0];
    const stream = await renderToStream(pdfDocument);
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Offer-Letter-${offerLetter.offerLetterId}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download offer letter error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
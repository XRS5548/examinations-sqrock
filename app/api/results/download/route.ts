import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { searchStudentResult } from "@/actions/results-public";
import ResultCardPDF, {
  type ResultCardPdfData,
} from "@/docs/ResultCardPDF";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rollNumber = String(body?.rollNumber || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!rollNumber || !email) {
      return Response.json(
        { error: "Roll number and email are required" },
        { status: 400 }
      );
    }

    const formData = new FormData();
    formData.append("rollNumber", rollNumber);
    formData.append("email", email);
    const lookup = await searchStudentResult(formData);

    if (!lookup.success || !lookup.result) {
      return Response.json(
        {
          error:
            typeof lookup.error === "string"
              ? lookup.error
              : "Result not found",
        },
        { status: 404 }
      );
    }

    const result = lookup.result;
    const status: ResultCardPdfData["status"] = result.cheating
      ? "REVIEW"
      : result.score >= result.passingScore
        ? "PASS"
        : "FAIL";
    const pdfData: ResultCardPdfData = {
      resultId: result.id,
      studentName: result.studentName || "Student",
      rollNumber: result.rollNumber || rollNumber,
      studentEmail: result.studentEmail || email,
      examName: result.examName || "Examination",
      score: result.score,
      totalMarks: result.examTotalMarks,
      percentage: result.percentage,
      passingScore: result.passingScore,
      status,
      submittedAt: result.submittedAt
        ? new Date(result.submittedAt).toISOString()
        : new Date().toISOString(),
      rank: result.rank,
    };
    const document = createElement(ResultCardPDF, {
      data: pdfData,
    }) as unknown as Parameters<typeof renderToBuffer>[0];
    const buffer = await renderToBuffer(document);
    const safeRollNumber = pdfData.rollNumber.replace(/[^a-zA-Z0-9_-]/g, "-");
    const safeExamName = pdfData.examName.replace(/[^a-zA-Z0-9_-]/g, "-");
    const fileName = `Result-${safeRollNumber}-${safeExamName}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Result PDF download error:", error);
    return Response.json(
      { error: "Failed to generate result PDF" },
      { status: 500 }
    );
  }
}

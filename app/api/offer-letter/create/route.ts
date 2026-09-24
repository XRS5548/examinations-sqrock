// app/api/offer-letter/create/route.ts
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "@/actions/company";
import { exams, examRegistrations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { getOrCreateOfferLetter } from "@/actions/offer-letter";

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
    const resultId = Number(body?.resultId);

    if (!Number.isInteger(resultId) || resultId <= 0) {
      return Response.json({ error: "Invalid registration" }, { status: 400 });
    }

    // Verify the registration belongs to this company's exam
    const registration = await db.select({
      examId: examRegistrations.examId,
    })
    .from(examRegistrations)
    .where(eq(examRegistrations.id, resultId))
    .limit(1);

    if (registration.length === 0 || !registration[0].examId) {
      return Response.json({ error: "Registration not found" }, { status: 404 });
    }

    const exam = await db.select()
      .from(exams)
      .where(and(eq(exams.id, registration[0].examId), eq(exams.companyId, company.id)))
      .limit(1);

    if (exam.length === 0) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create the offer letter
    const offerLetter = await getOrCreateOfferLetter(resultId);

    return Response.json({ success: true, offerLetter });
  } catch (error) {
    console.error("Create offer letter error:", error);
    return Response.json({ error: "Failed to create offer letter" }, { status: 500 });
  }
}
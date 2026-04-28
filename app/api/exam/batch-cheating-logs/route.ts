// app/api/exam/batch-cheating-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cheatingLogs, examRegistrations, examAttemptLogs } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { z } from "zod";

const batchSchema = z.object({
  registrationId: z.number(),
  violations: z.array(z.object({
    type: z.string(),
    timestamp: z.number(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = batchSchema.parse(body);
    const { registrationId, violations } = validated;

    // Verify registration exists and exam not completed
    const registration = await db
      .select()
      .from(examRegistrations)
      .where(eq(examRegistrations.id, registrationId))
      .limit(1);

    if (registration.length === 0) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration[0].status === "completed") {
      return NextResponse.json(
        { error: "Exam already completed" },
        { status: 400 }
      );
    }

    // Rate limiting
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentLogs = await db
      .select({ count: count() })
      .from(cheatingLogs)
      .where(
        and(
          eq(cheatingLogs.registrationId, registrationId),
          sql`${cheatingLogs.createdAt} >= ${oneMinuteAgo}`
        )
      );

    const recentCount = Number(recentLogs[0]?.count) || 0;
    if (recentCount + violations.length > 20) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Batch insert violations
    await db.insert(cheatingLogs).values(
      violations.map(v => ({
        registrationId: registrationId,
        eventType: v.type,
        createdAt: new Date(v.timestamp),
      }))
    );

    // Check if should flag for cheating
    const totalViolations = await db
      .select({ count: count() })
      .from(cheatingLogs)
      .where(eq(cheatingLogs.registrationId, registrationId));

    const violationCount = Number(totalViolations[0]?.count) || 0;
    
    if (violationCount >= 5) {
      await db
        .update(examRegistrations)
        .set({ cheating: true })
        .where(eq(examRegistrations.id, registrationId));
    }

    // Log batch event
    await db.insert(examAttemptLogs).values({
      registrationId: registrationId,
      action: "batch_cheating_events",
      data: { count: violations.length },
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      success: true,
      flagged: violationCount >= 5,
      totalViolations: violationCount 
    });
  } catch (error) {
    console.error("Batch cheating logs error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
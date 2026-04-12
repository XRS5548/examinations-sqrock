// actions/dashboard.ts
"use server";

import { db } from "@/db";
import { exams, students, examRegistrations } from "@/db/schema";
import { eq, and, desc, gt, lt } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompany } from "./company";

export async function getDashboardStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        totalExams: 0,
        totalStudents: 0,
        completedExams: 0,
        cheatingCases: 0,
      };
    }

    const company = await getUserCompany();
    if (!company) {
      console.log("No company found for user:", user.id);
      return {
        totalExams: 0,
        totalStudents: 0,
        completedExams: 0,
        cheatingCases: 0,
      };
    }

    console.log("Company found:", company.id, company.name);

    // Get total exams using count() instead of sql
    const examsCount = await db.$count(
      exams,
      eq(exams.companyId, company.id)
    );

    // Get total students
    const studentsCount = await db.$count(
      students,
      eq(students.companyId, company.id)
    );

    // Get completed exams (result announced)
    const completedExams = await db.$count(
      exams,
      and(
        eq(exams.companyId, company.id),
        eq(exams.resultAnnounced, true)
      )
    );

    // Get cheating cases
    const cheatingCases = await db.$count(
      examRegistrations,
      and(
        eq(examRegistrations.cheating, true)
      )
    );

    // Get previous period data for trends (last month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Previous exams count
    const previousExamsList = await db
      .select()
      .from(exams)
      .where(
        and(
          eq(exams.companyId, company.id),
          lt(exams.createdAt, lastMonth)
        )
      );

    // Previous students count
    const previousStudentsList = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.companyId, company.id),
          lt(students.createdAt, lastMonth)
        )
      );

    // Previous completed exams
    const previousCompletedList = await db
      .select()
      .from(exams)
      .where(
        and(
          eq(exams.companyId, company.id),
          eq(exams.resultAnnounced, true),
          lt(exams.createdAt, lastMonth)
        )
      );

    // Previous cheating cases
    const previousCheatingList = await db
      .select()
      .from(examRegistrations)
      .leftJoin(exams, eq(examRegistrations.examId, exams.id))
      .where(
        and(
          eq(exams.companyId, company.id),
          eq(examRegistrations.cheating, true),
          lt(examRegistrations.submittedAt, lastMonth)
        )
      );

    const stats = {
      totalExams: examsCount,
      totalStudents: studentsCount,
      completedExams: completedExams,
      cheatingCases: cheatingCases,
      previousPeriod: {
        totalExams: previousExamsList.length,
        totalStudents: previousStudentsList.length,
        completedExams: previousCompletedList.length,
        cheatingCases: previousCheatingList.length,
      },
    };

    console.log("Dashboard stats:", stats);
    return stats;
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return {
      totalExams: 0,
      totalStudents: 0,
      completedExams: 0,
      cheatingCases: 0,
    };
  }
}

export async function getRecentExams(limit: number = 5) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const company = await getUserCompany();
    if (!company) {
      console.log("No company found for recent exams");
      return [];
    }

    const recentExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        examDate: exams.examDate,
        isLive: exams.isLive,
        createdAt: exams.createdAt,
      })
      .from(exams)
      .where(eq(exams.companyId, company.id))
      .orderBy(desc(exams.createdAt))
      .limit(limit);

    console.log(`Found ${recentExams.length} recent exams`);
    return recentExams;
  } catch (error) {
    console.error("Get recent exams error:", error);
    return [];
  }
}

export async function getRecentStudents(limit: number = 5) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const company = await getUserCompany();
    if (!company) {
      console.log("No company found for recent students");
      return [];
    }

    const recentStudents = await db
      .select({
        id: students.id,
        name: students.name,
        email: students.email,
        createdAt: students.createdAt,
      })
      .from(students)
      .where(eq(students.companyId, company.id))
      .orderBy(desc(students.createdAt))
      .limit(limit);

    console.log(`Found ${recentStudents.length} recent students`);
    return recentStudents;
  } catch (error) {
    console.error("Get recent students error:", error);
    return [];
  }
}

export async function getUpcomingExams(limit: number = 5) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const company = await getUserCompany();
    if (!company) {
      return [];
    }

    const now = new Date();
    
    const upcomingExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        examDate: exams.examDate,
        isLive: exams.isLive,
      })
      .from(exams)
      .where(
        and(
          eq(exams.companyId, company.id),
          gt(exams.examDate, now)
        )
      )
      .orderBy(exams.examDate)
      .limit(limit);

    return upcomingExams;
  } catch (error) {
    console.error("Get upcoming exams error:", error);
    return [];
  }
}

// Debug function to check database connection
export async function debugDashboard() {
  try {
    const user = await getCurrentUser();
    console.log("Current user:", user);
    
    const company = await getUserCompany();
    console.log("Current company:", company);
    
    if (company) {
      const allExams = await db.select().from(exams).where(eq(exams.companyId, company.id));
      console.log("All exams for company:", allExams);
      
      const allStudents = await db.select().from(students).where(eq(students.companyId, company.id));
      console.log("All students for company:", allStudents);
    }
    
    return { user, company };
  } catch (error) {
    console.error("Debug error:", error);
    return { error };
  }
}
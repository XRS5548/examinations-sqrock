// actions/home.ts
"use server";

import { db } from "@/db";
import { exams, announcements, articles, companies } from "@/db/schema";
import { eq, desc, gt, and, isNotNull, sql } from "drizzle-orm";

// Get ALL public exams for hero section
export async function getAllExams() {
  try {
    const allExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        description: exams.description,
        examDate: exams.examDate,
        durationMinutes: exams.durationMinutes,
        isLive: exams.isLive,
        isClosed: exams.isClosed,
        companyName: companies.name,
      })
      .from(exams)
      .leftJoin(companies, eq(exams.companyId, companies.id))
      .where(
        and(
          eq(exams.isPublic, true)  // ✅ Only public exams
        )
      )
      .orderBy(desc(exams.isLive), desc(exams.examDate))
      .limit(50);

    return allExams.map(exam => ({
      id: exam.id,
      name: exam.name,
      description: exam.description,
      examDate: exam.examDate,
      durationMinutes: exam.durationMinutes ?? 0,
      isLive: exam.isLive ?? false,
      isClosed: exam.isClosed ?? false,
      companyName: exam.companyName,
    }));
  } catch (error) {
    console.error("Error fetching all exams:", error);
    return [];
  }
}

// Get LIVE public exams - only open exams
export async function getLiveExams() {
  try {
    const liveExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        examDate: exams.examDate,
        description: exams.description,
        durationMinutes: exams.durationMinutes,
        isLive: exams.isLive,
        isClosed: exams.isClosed,
        companyName: companies.name,
      })
      .from(exams)
      .leftJoin(companies, eq(exams.companyId, companies.id))
      .where(
        and(
          eq(exams.isPublic, true),    // ✅ Only public exams
          eq(exams.isLive, true),
          eq(exams.isClosed, false)
        )
      )
      .orderBy(desc(exams.examDate))
      .limit(10);

    return liveExams;
  } catch (error) {
    console.error("Error fetching live exams:", error);
    return [];
  }
}

// Get UPCOMING public exams
export async function getUpcomingExams() {
  try {
    const now = new Date();
    const upcomingExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        examDate: exams.examDate,
        isLive: exams.isLive,
        isClosed: exams.isClosed,
      })
      .from(exams)
      .where(
        and(
          eq(exams.isPublic, true),    // ✅ Only public exams
          gt(exams.examDate, now),
          eq(exams.isClosed, false)
        )
      )
      .orderBy(exams.examDate)
      .limit(10);

    return upcomingExams;
  } catch (error) {
    console.error("Error fetching upcoming exams:", error);
    return [];
  }
}

// Get RESULT exams (only public ones)
export async function getResultExams() {
  try {
    const resultExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        examDate: exams.examDate,
        description: exams.description,
        totalMarks: exams.totalMarks,
        resultAnnounced: exams.resultAnnounced,
        isClosed: exams.isClosed,
      })
      .from(exams)
      .where(
        and(
          eq(exams.isPublic, true),        // ✅ Only public exams
          eq(exams.resultAnnounced, true)
        )
      )
      .orderBy(desc(exams.examDate))
      .limit(10);

    return resultExams;
  } catch (error) {
    console.error("Error fetching result exams:", error);
    return [];
  }
}

// Get featured public exams (with additional filters)
export async function getFeaturedExams() {
  try {
    const featuredExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        description: exams.description,
        examDate: exams.examDate,
        coverImage: exams.coverImage,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
      })
      .from(exams)
      .leftJoin(companies, eq(exams.companyId, companies.id))
      .where(
        and(
          eq(exams.isPublic, true),        // ✅ Only public exams
          eq(exams.isLive, true),
          eq(exams.isClosed, false),
          isNotNull(exams.coverImage)      // Only exams with cover images
        )
      )
      .orderBy(desc(exams.examDate))
      .limit(6);

    return featuredExams;
  } catch (error) {
    console.error("Error fetching featured exams:", error);
    return [];
  }
}

// Get exam by ID with public check
export async function getExamById(examId: number) {
  try {
    const exam = await db
      .select({
        id: exams.id,
        name: exams.name,
        description: exams.description,
        examDate: exams.examDate,
        durationMinutes: exams.durationMinutes,
        totalMarks: exams.totalMarks,
        isLive: exams.isLive,
        isClosed: exams.isClosed,
        isPublic: exams.isPublic,
        syllabusPdf: exams.syllabusPdf,
        coverImage: exams.coverImage,
        companyId: exams.companyId,
      })
      .from(exams)
      .where(
        and(
          eq(exams.id, examId),
          eq(exams.isPublic, true)  // ✅ Only return if public
        )
      )
      .limit(1);

    if (exam.length === 0) {
      return null;
    }

    return exam[0];
  } catch (error) {
    console.error("Error fetching exam by ID:", error);
    return null;
  }
}

// Search public exams
export async function searchExams(searchTerm: string) {
  try {
    const searchResults = await db
      .select({
        id: exams.id,
        name: exams.name,
        description: exams.description,
        examDate: exams.examDate,
        companyName: companies.name,
      })
      .from(exams)
      .leftJoin(companies, eq(exams.companyId, companies.id))
      .where(
        and(
          eq(exams.isPublic, true),  // ✅ Only public exams
          // Simple search - you can make this more sophisticated
          // This is a simplified version
        )
      )
      .orderBy(desc(exams.examDate))
      .limit(20);

    // Filter by search term in memory (or use SQL LIKE for better performance)
    const filtered = searchResults.filter(exam => 
      exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered;
  } catch (error) {
    console.error("Error searching exams:", error);
    return [];
  }
}

// Rest of the functions remain the same...
export async function getAnnouncements() {
  try {
    const announcementsList = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        description: announcements.description,
        createdAt: announcements.createdAt,
      })
      .from(announcements)
      .orderBy(desc(announcements.createdAt))
      .limit(10);

    return announcementsList;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

export async function getArticles() {
  try {
    const articlesList = await db
      .select({
        id: articles.id,
        title: articles.title,
        description: articles.description,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(10);

    return articlesList;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function getCompanies() {
  try {
    const companiesList = await db
      .select({
        id: companies.id,
        name: companies.name,
        industry: companies.industry,
        logoUrl: companies.logoUrl,
      })
      .from(companies)
      .orderBy(companies.name)
      .limit(20);

    return companiesList;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

// Get public exams count for a company
export async function getPublicExamsCount(companyId: number) {
  try {
    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(exams)
      .where(
        and(
          eq(exams.companyId, companyId),
          eq(exams.isPublic, true)
        )
      );

    return Number(count[0]?.count) || 0;
  } catch (error) {
    console.error("Error fetching public exams count:", error);
    return 0;
  }
}
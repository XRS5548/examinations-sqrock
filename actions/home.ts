// actions/home.ts (updated)
"use server";

import { db } from "@/db";
import { exams, announcements, articles, companies } from "@/db/schema";
import { eq, desc, gt } from "drizzle-orm";

// New function to fetch ALL exams for hero section
// actions/home.ts (update getAllExams function)
export async function getAllExams() {
  try {
    const allExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        description: exams.description, // Add description field
        examDate: exams.examDate,
        durationMinutes: exams.durationMinutes,
        isLive: exams.isLive,
        companyName: companies.name,
      })
      .from(exams)
      .leftJoin(companies, eq(exams.companyId, companies.id))
      .orderBy(desc(exams.isLive), desc(exams.examDate))
      .limit(50);

    return allExams.map(exam => ({
      id: exam.id,
      name: exam.name,
      description: exam.description,
      examDate: exam.examDate,
      durationMinutes: exam.durationMinutes ?? 0,
      isLive: exam.isLive ?? false,
      companyName: exam.companyName,
    }));
  } catch (error) {
    console.error("Error fetching all exams:", error);
    return [];
  }
}
export async function getLiveExams() {
  try {
    const liveExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        examDate: exams.examDate,
        description: exams.description, // Add description field
        durationMinutes: exams.durationMinutes,
        isLive: exams.isLive,
        companyName: companies.name,
      })
      .from(exams)
      .leftJoin(companies, eq(exams.companyId, companies.id))
      .where(eq(exams.isLive, true))
      .orderBy(desc(exams.examDate))
      .limit(10);

    return liveExams;
  } catch (error) {
    console.error("Error fetching live exams:", error);
    return [];
  }
}

export async function getUpcomingExams() {
  try {
    const now = new Date();
    const upcomingExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        examDate: exams.examDate,
        isLive: exams.isLive,
      })
      .from(exams)
      .where(gt(exams.examDate, now))
      .orderBy(exams.examDate)
      .limit(10);

    return upcomingExams;
  } catch (error) {
    console.error("Error fetching upcoming exams:", error);
    return [];
  }
}

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

export async function getResultExams() {
  try {
    const resultExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        examDate: exams.examDate,
        description: exams.description, // Add description field
        totalMarks: exams.totalMarks,
        resultAnnounced: exams.resultAnnounced,
      })
      .from(exams)
      .where(eq(exams.resultAnnounced, true))
      .orderBy(desc(exams.examDate))
      .limit(10);

    return resultExams;
  } catch (error) {
    console.error("Error fetching result exams:", error);
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
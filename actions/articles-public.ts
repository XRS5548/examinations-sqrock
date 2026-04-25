// actions/articles-public.ts
"use server";

import { db } from "@/db";
import { articles, exams, announcements } from "@/db/schema";
import { desc, asc, ilike, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function getFeaturedArticle() {
  try {
    const featured = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(1);
    
    return featured[0] || null;
  } catch (error) {
    console.error("Get featured article error:", error);
    return null;
  }
}

interface GetArticlesParams {
  page: number;
  search: string;
  sort: string;
  limit?: number;
}

export async function getArticles({ page, search, sort, limit = 9 }: GetArticlesParams) {
  try {
    const offset = (page - 1) * limit;
    
    // Get total count
    let total = 0;
    if (search) {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(ilike(articles.title, `%${search}%`));
      total = Number(countResult[0]?.count || 0);
    } else {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles);
      total = Number(countResult[0]?.count || 0);
    }
    
    // Get paginated results
    let query;
    if (search) {
      query = db
        .select()
        .from(articles)
        .where(ilike(articles.title, `%${search}%`));
    } else {
      query = db.select().from(articles);
    }
    
    // Apply sorting
    if (sort === "oldest") {
      query = query.orderBy(asc(articles.createdAt));
    } else {
      query = query.orderBy(desc(articles.createdAt));
    }
    
    const articlesList = await query.limit(limit).offset(offset);
    
    return {
      articles: articlesList,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Get articles error:", error);
    return { articles: [], total: 0, page: 1, totalPages: 0 };
  }
}

export async function getSidebarArticles(limit: number = 5) {
  try {
    const latestArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(limit);
    
    return latestArticles;
  } catch (error) {
    console.error("Get sidebar articles error:", error);
    return [];
  }
}

export async function getLiveExams(limit: number = 4) {
  try {
    const liveExams = await db
      .select({
        id: exams.id,
        name: exams.name,
        examDate: exams.examDate,
      })
      .from(exams)
      .where(eq(exams.isLive, true))
      .orderBy(desc(exams.examDate))
      .limit(limit);
    
    return liveExams;
  } catch (error) {
    console.error("Get live exams error:", error);
    return [];
  }
}

export async function getAnnouncements(limit: number = 4) {
  try {
    const announcementsList = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        createdAt: announcements.createdAt,
      })
      .from(announcements)
      .orderBy(desc(announcements.createdAt))
      .limit(limit);
    
    return announcementsList;
  } catch (error) {
    console.error("Get announcements error:", error);
    return [];
  }
}
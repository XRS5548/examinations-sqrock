// actions/article.ts
"use server";

import { db } from "@/db";
import { articles, exams, announcements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getArticleById(articleId: number) {
  try {
    const articleList = await db
      .select({
        id: articles.id,
        title: articles.title,
        description: articles.description,
        content: articles.content,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
        userId: articles.userId,
      })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (articleList.length === 0) {
      return null;
    }

    // Fetch author name if needed
    const article = articleList[0];
    return {
      ...article,
      author: "ExaminerMax Team", // You can fetch from users table if needed
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export async function getLatestArticles(limit: number = 5) {
  try {
    const latestArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        description: articles.description,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(limit);

    return latestArticles;
  } catch (error) {
    console.error("Error fetching latest articles:", error);
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
        isLive: exams.isLive,
      })
      .from(exams)
      .where(eq(exams.isLive, true))
      .orderBy(desc(exams.examDate))
      .limit(limit);

    return liveExams;
  } catch (error) {
    console.error("Error fetching live exams:", error);
    return [];
  }
}

export async function getAnnouncements(limit: number = 4) {
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
      .limit(limit);

    return announcementsList;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

export async function getAllArticles() {
  try {
    const allArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        description: articles.description,
        coverImage: articles.coverImage,
        createdAt: articles.createdAt,
      })
      .from(articles)
      .orderBy(desc(articles.createdAt));

    return allArticles;
  } catch (error) {
    console.error("Error fetching all articles:", error);
    return [];
  }
}
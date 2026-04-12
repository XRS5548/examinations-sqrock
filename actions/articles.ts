// actions/articles.ts
"use server";

import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
  coverImage: z.string().url().optional().nullable(),
});

const updateArticleSchema = z.object({
  articleId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
  coverImage: z.string().url().optional().nullable(),
});

export async function createArticle(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      content: formData.get("content") as string,
      coverImage: formData.get("coverImage") as string,
    };

    const validated = createArticleSchema.parse(rawData);

    // Insert article
    const [newArticle] = await db.insert(articles).values({
      userId: user.id,
      title: validated.title,
      description: validated.description,
      content: validated.content,
      coverImage: validated.coverImage || null,
      createdAt: new Date(),
    }).returning();

    if (!newArticle) {
      return { success: false, error: "Failed to create article" };
    }

    revalidatePath("/dashboard/articles");
    
    return { success: true, article: newArticle };
  } catch (error) {
    console.error("Create article error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error };
    }
    return { success: false, error: "Failed to create article" };
  }
}

export async function updateArticle(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      articleId: formData.get("articleId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      content: formData.get("content") as string,
      coverImage: formData.get("coverImage") as string,
    };

    const validated = updateArticleSchema.parse(rawData);
    const articleId = parseInt(validated.articleId);

    // Check if article exists and belongs to user
    const existingArticle = await db.select()
      .from(articles)
      .where(
        and(
          eq(articles.id, articleId),
          eq(articles.userId, user.id)
        )
      )
      .limit(1);

    if (existingArticle.length === 0) {
      return { success: false, error: "Article not found" };
    }

    // Update article
    const [updatedArticle] = await db.update(articles)
      .set({
        title: validated.title,
        description: validated.description,
        content: validated.content,
        coverImage: validated.coverImage || null,
      })
      .where(eq(articles.id, articleId))
      .returning();

    if (!updatedArticle) {
      return { success: false, error: "Failed to update article" };
    }

    revalidatePath("/dashboard/articles");
    
    return { success: true, article: updatedArticle };
  } catch (error) {
    console.error("Update article error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error};
    }
    return { success: false, error: "Failed to update article" };
  }
}

export async function deleteArticle(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if article exists and belongs to user
    const existingArticle = await db.select()
      .from(articles)
      .where(
        and(
          eq(articles.id, id),
          eq(articles.userId, user.id)
        )
      )
      .limit(1);

    if (existingArticle.length === 0) {
      return { success: false, error: "Article not found" };
    }

    // Delete article
    await db.delete(articles).where(eq(articles.id, id));

    revalidatePath("/dashboard/articles");
    
    return { success: true };
  } catch (error) {
    console.error("Delete article error:", error);
    return { success: false, error: "Failed to delete article" };
  }
}

export async function getArticlesByUser() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const articlesList = await db.select()
      .from(articles)
      .where(eq(articles.userId, user.id))
      .orderBy(articles.createdAt);

    return articlesList;
  } catch (error) {
    console.error("Get articles error:", error);
    return [];
  }
}

export async function getArticleById(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const articleList = await db.select()
      .from(articles)
      .where(
        and(
          eq(articles.id, id),
          eq(articles.userId, user.id)
        )
      )
      .limit(1);

    return articleList[0] || null;
  } catch (error) {
    console.error("Get article error:", error);
    return null;
  }
}
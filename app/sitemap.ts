// app/sitemap.ts
import { MetadataRoute } from "next";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.examinermax.com";

  // Fetch all articles from database
  const allArticles = await db
    .select({
      id: articles.id,
      createdAt: articles.createdAt,
    })
    .from(articles)
    .orderBy(desc(articles.createdAt));

  // Generate sitemap entries for articles
  const articleEntries: MetadataRoute.Sitemap = allArticles.map((article) => ({
    url: `${baseUrl}/view/${article.id}`,
    lastModified: article.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#features`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#exams`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#announcements`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/#articles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#companies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Combine all entries
  return [...staticPages, ...articleEntries];
}
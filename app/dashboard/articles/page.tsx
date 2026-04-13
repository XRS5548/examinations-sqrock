// app/dashboard/articles/page.tsx
import { Suspense } from "react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { BookOpen } from "lucide-react";
import { CreateArticleDialog } from "./CreateArticleDialog";
import { ArticlesTable } from "./ArticlesTable";
export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Please login to view articles</p>
      </div>
    );
  }

  const articlesList = await db.select()
    .from(articles)
    .where(eq(articles.userId, user.id))
    .orderBy(desc(articles.createdAt));

  // Transform data to match expected types
  const transformedArticles = articlesList.map(article => ({
    id: article.id,
    title: article.title,
    description: article.description,
    content: article.content,
    coverImage: article.coverImage,
    createdAt: article.createdAt,
    userId: article.userId ?? 0, // Convert null to 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Create and manage blog posts, tutorials, and educational content
          </p>
        </div>
        <CreateArticleDialog />
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading articles...</div>}>
        <ArticlesTable initialArticles={transformedArticles} />
      </Suspense>
    </div>
  );
}
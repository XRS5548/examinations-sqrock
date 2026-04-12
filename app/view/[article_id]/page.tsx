// app/view/[article_id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getArticleById, getLatestArticles, getLiveExams, getAnnouncements } from "@/actions/articleClientSide";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleContent } from "./ArticleContent";
import { RelatedArticles } from "./RelatedArticles";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface PageProps {
  params: Promise<{ article_id: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { article_id } = await params;
  const articleId = parseInt(article_id);

  if (isNaN(articleId)) {
    notFound();
  }

  const article = await getArticleById(articleId);
  
  if (!article) {
    notFound();
  }

  const latestArticles = await getLatestArticles();
  const liveExams = await getLiveExams();
  const announcements = await getAnnouncements();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Article */}
          <div className="lg:col-span-2 space-y-6">
            <ArticleHeader article={article} />
            <ArticleContent content={article.content} />
            <Suspense fallback={<div className="text-center py-8">Loading related articles...</div>}>
              <RelatedArticles currentArticleId={articleId} articles={latestArticles} />
            </Suspense>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="text-center py-8">Loading sidebar...</div>}>
              <Sidebar 
                latestArticles={latestArticles}
                liveExams={liveExams}
                announcements={announcements}
              />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            © 2026 ExaminerMax. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
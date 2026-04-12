// components/view/RelatedArticles.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

type Article = {
  id: number;
  title: string | null;
  description: string | null;
  createdAt: Date | null;
};

interface RelatedArticlesProps {
  currentArticleId: number;
  articles: Article[];
}

export function RelatedArticles({ currentArticleId, articles }: RelatedArticlesProps) {
  const relatedArticles = articles
    .filter((a) => a.id !== currentArticleId)
    .slice(0, 3);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 pt-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            href={`/view/${article.id}`}
            className="group block p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all hover:border-red-200"
          >
            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {article.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {article.createdAt
                  ? format(new Date(article.createdAt), "MMM dd, yyyy")
                  : "Recent"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
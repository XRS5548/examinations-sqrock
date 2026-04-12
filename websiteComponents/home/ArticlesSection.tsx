// components/home/ArticlesSection.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Article = {
  id: number;
  title: string | null;
  description: string | null;
  createdAt: Date | null;
};

interface ArticlesSectionProps {
  articles: Article[];
}

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  const router = useRouter();

  const handleArticleClick = (articleId: number) => {
    router.push(`/view/${articleId}`);
  };

  return (
    <div className="lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Latest Articles</h2>
        <Link href="/#articles" className="text-sm text-red-600 hover:text-red-700">View all →</Link>
      </div>
      <div className="space-y-4">
        {articles.length > 0 ? (
          articles.map((article, idx) => (
            <div 
              key={article.id} 
              onClick={() => handleArticleClick(article.id)}
              className="group flex gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex-shrink-0 w-12 text-2xl font-bold text-gray-300 dark:text-gray-700">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-red-600 uppercase">Article</span>
                  <span className="text-xs text-gray-500">{format(new Date(article.createdAt!), "MMM dd, yyyy")}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-red-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {article.description}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">No articles available</div>
        )}
      </div>
    </div>
  );
}
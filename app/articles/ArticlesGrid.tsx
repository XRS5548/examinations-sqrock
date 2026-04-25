// app/articles/ArticlesGrid.tsx
"use client";

import { ArticleCard } from "./ArticleCard";
import { Pagination } from "./Pagination";

type Article = {
  id: number;
  title: string | null;
  description: string | null;
  coverImage: string | null;
  category: string | null;
  createdAt: Date | null;
};

interface ArticlesGridProps {
  articles: Article[];
  total: number;
  currentPage: number;
  search: string;
  sort: string;
}

export function ArticlesGrid({ articles, total, currentPage, search, sort }: ArticlesGridProps) {
  const totalPages = Math.ceil(total / 9);

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
        <p className="text-gray-500">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {articles.map((article, index) => (
          <ArticleCard key={article.id} article={article} index={index} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            search={search}
            sort={sort}
          />
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {articles.length} of {total} articles
      </div>
    </div>
  );
}
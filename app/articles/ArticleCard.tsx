// app/articles/ArticleCard.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";

type Article = {
  id: number;
  title: string | null;
  description: string | null;
  coverImage: string | null;
  category: string | null;
  createdAt: Date | null;
};

interface ArticleCardProps {
  article: Article;
  index?: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const calculateReadTime = (text: string | null) => {
    const wordsPerMinute = 200;
    const wordCount = text?.split(/\s+/).length || 0;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const categories = [
    { name: "Exam Tips", color: "bg-blue-100 text-blue-700" },
    { name: "Updates", color: "bg-green-100 text-green-700" },
    { name: "Strategies", color: "bg-purple-100 text-purple-700" },
    { name: "Guides", color: "bg-orange-100 text-orange-700" },
    { name: "News", color: "bg-red-100 text-red-700" },
    { name: "General", color: "bg-gray-100 text-gray-700" },
  ];

  const categoryStyle = article.category
    ? categories.find(c => c.name.toLowerCase() === article.category?.toLowerCase()) || categories[5]
    : categories[5];

  return (
    <Link href={`/view/${article.id}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title || "Article cover"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-4xl">📖</span>
            </div>
          )}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${categoryStyle.color}`}>
            {article.category || "General"}
          </div>
          {index === 0 && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-yellow-500 text-white text-xs font-semibold">
              Latest
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {article.description}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>
                {article.createdAt
                  ? format(new Date(article.createdAt), "MMM dd, yyyy")
                  : "Recent"}
              </span>
              <span>•</span>
              <span>{calculateReadTime(article.description)} min read</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 font-semibold group-hover:gap-2 transition-all">
              Read
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
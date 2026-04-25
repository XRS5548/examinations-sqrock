// components/articles/ArticlesHero.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";

type Article = {
  id: number;
  title: string | null;
  description: string | null;
  coverImage: string | null;
  createdAt: Date | null;
};

interface ArticlesHeroProps {
  featuredArticle: Article | null;
}

export function ArticlesHero({ featuredArticle }: ArticlesHeroProps) {
  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text?.split(/\s+/).length || 0;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold mb-4">
          Editorial
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Insights, Articles & Exam Resources
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Latest strategies, exam updates and guides to help you succeed.
        </p>
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <Link href={`/view/${featuredArticle.id}`} className="group block">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl">
            {featuredArticle.coverImage && (
              <div className="absolute inset-0 opacity-30">
                <img
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title || "Featured article"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="relative z-10 p-8 md:p-12">
              <div className="inline-block px-3 py-1 bg-red-600 text-white rounded-full text-xs font-semibold mb-6">
                Featured Article
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors">
                {featuredArticle.title}
              </h2>
              <p className="text-gray-200 text-lg mb-6 max-w-2xl">
                {featuredArticle.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-300">
                <span>
                  {featuredArticle.createdAt
                    ? format(new Date(featuredArticle.createdAt), "MMMM dd, yyyy")
                    : "Recent"}
                </span>
                <span>•</span>
                <span>{calculateReadTime(featuredArticle.description || "")} min read</span>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                Read article →
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
// components/view/ArticleHeader.tsx
"use client";

import { format } from "date-fns";
import { Calendar, User, Clock } from "lucide-react";

interface ArticleHeaderProps {
  article: {
    title: string | null;
    description: string | null;
    coverImage: string | null;
    createdAt: Date | null;
    author?: string;
  };
}

export function ArticleHeader({ article }: ArticleHeaderProps) {
  // Calculate reading time (approx 200 words per minute)
  const readingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).length || 0;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      {article.coverImage && (
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title || "Article cover"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title and Description */}
      <div className="space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          {article.title}
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          {article.description}
        </p>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{article.author || "ExaminerMax Team"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {article.createdAt
              ? format(new Date(article.createdAt), "MMMM dd, yyyy")
              : "Recent"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{readingTime(article.title || "")} min read</span>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <span className="text-sm font-medium text-gray-700">Share:</span>
        <button
          onClick={() => {
            navigator.share?.({
              title: article.title || "",
              text: article.description || "",
              url: window.location.href,
            });
          }}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Share
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            article.title || ""
          )}&url=${encodeURIComponent(window.location.href)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          Twitter
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            window.location.href
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
// components/articles/ArticleSidebar.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";

type Article = {
  id: number;
  title: string | null;
  createdAt: Date | null;
};

type Exam = {
  id: number;
  name: string | null;
  examDate: Date | null;
};

type Announcement = {
  id: number;
  title: string | null;
  createdAt: Date | null;
};

interface ArticleSidebarProps {
  latestArticles: Article[];
  liveExams: Exam[];
  announcements: Announcement[];
}

export function ArticleSidebar({ latestArticles, liveExams, announcements }: ArticleSidebarProps) {
  return (
    <div className="space-y-8 sticky top-24">
      {/* Latest Articles */}
      <div>
        <div className="border-l-4 border-red-600 pl-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900">Latest Articles</h3>
          <p className="text-sm text-gray-500">Recently published</p>
        </div>
        <div className="space-y-4">
          {latestArticles.map((article) => (
            <Link
              key={article.id}
              href={`/view/${article.id}`}
              className="block group"
            >
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-500 mt-2">
                  {article.createdAt
                    ? format(new Date(article.createdAt), "MMM dd, yyyy")
                    : "Recent"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Exams */}
      {liveExams.length > 0 && (
        <div>
          <div className="border-l-4 border-green-600 pl-4 mb-6">
            <h3 className="text-xl font-bold text-gray-900">Live Exams</h3>
            <p className="text-sm text-gray-500">Active right now</p>
          </div>
          <div className="space-y-3">
            {liveExams.slice(0, 4).map((exam) => (
              <div key={exam.id} className="p-4 border border-green-200 rounded-xl bg-green-50/30">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{exam.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white">
                    Live
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {exam.examDate
                    ? format(new Date(exam.examDate), "MMM dd, yyyy")
                    : "Date TBA"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <div>
          <div className="border-l-4 border-yellow-600 pl-4 mb-6">
            <h3 className="text-xl font-bold text-gray-900">Announcements</h3>
            <p className="text-sm text-gray-500">Stay updated</p>
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 4).map((ann) => (
              <div key={ann.id} className="p-4 border border-yellow-200 rounded-xl bg-yellow-50/30">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {ann.createdAt
                        ? format(new Date(ann.createdAt), "MMM dd, yyyy")
                        : "Recent"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
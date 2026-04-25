// components/results/ResultsSidebar.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";

interface SidebarData {
  announcements: Array<{ id: number; title: string | null; createdAt: Date | null }>;
  liveExams: Array<{ id: number; name: string | null; examDate: Date | null }>;
  articles: Array<{ id: number; title: string | null; createdAt: Date | null }>;
}

export function ResultsSidebar({ announcements, liveExams, articles }: SidebarData) {
  return (
    <div className="space-y-8 sticky top-24">
      {/* Live Exams */}
      {liveExams.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="border-l-4 border-green-600 pl-3 mb-4">
            <h3 className="font-bold text-gray-900">Live Exams</h3>
            <p className="text-xs text-gray-500">Active right now</p>
          </div>
          <div className="space-y-3">
            {liveExams.slice(0, 3).map((exam) => (
              <div key={exam.id} className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-gray-900 text-sm mb-1">{exam.name}</p>
                <p className="text-xs text-gray-500">
                  {exam.examDate ? format(new Date(exam.examDate), "MMM dd, yyyy") : "Date TBA"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="border-l-4 border-yellow-600 pl-3 mb-4">
            <h3 className="font-bold text-gray-900">Announcements</h3>
            <p className="text-xs text-gray-500">Latest updates</p>
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-1.5" />
                <div>
                  <p className="text-sm text-gray-800 font-medium line-clamp-2">{ann.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {ann.createdAt ? format(new Date(ann.createdAt), "MMM dd, yyyy") : "Recent"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Articles */}
      {articles.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="border-l-4 border-red-600 pl-3 mb-4">
            <h3 className="font-bold text-gray-900">Recent Articles</h3>
            <p className="text-xs text-gray-500">Helpful resources</p>
          </div>
          <div className="space-y-3">
            {articles.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/view/${article.id}`} className="block group">
                <p className="text-sm text-gray-800 font-medium group-hover:text-red-600 transition line-clamp-2">
                  {article.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {article.createdAt ? format(new Date(article.createdAt), "MMM dd, yyyy") : "Recent"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
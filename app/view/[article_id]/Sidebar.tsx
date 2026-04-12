// components/view/Sidebar.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Eye, Bell, BookOpen } from "lucide-react";

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

interface SidebarProps {
  latestArticles: Article[];
  liveExams: Exam[];
  announcements: Announcement[];
}

export function Sidebar({ latestArticles, liveExams, announcements }: SidebarProps) {
  return (
    <div className="space-y-6 sticky top-24">
      {/* Latest Articles Section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 py-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Latest Articles
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {latestArticles.slice(0, 5).map((article) => (
            <Link
              key={article.id}
              href={`/view/${article.id}`}
              className="block px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                {article.title}
              </h4>
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
          {latestArticles.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">
              No articles available
            </div>
          )}
        </div>
      </div>

      {/* Live Exams Section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-500 px-5 py-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Exams
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {liveExams.slice(0, 4).map((exam) => (
            <div key={exam.id} className="px-5 py-3">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-medium text-gray-900">{exam.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Live
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>
                  {exam.examDate
                    ? format(new Date(exam.examDate), "MMM dd, yyyy")
                    : "Date TBA"}
                </span>
              </div>
            </div>
          ))}
          {liveExams.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">
              No live exams at the moment
            </div>
          )}
        </div>
      </div>

      {/* Announcements Section */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-5 py-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Announcements
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {announcements.slice(0, 4).map((ann) => (
            <div key={ann.id} className="px-5 py-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {ann.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {ann.createdAt
                        ? format(new Date(ann.createdAt), "MMM dd, yyyy")
                        : "Recent"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">
              No announcements
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
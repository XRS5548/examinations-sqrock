// components/results/ResultsSidebar.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";
import { 
  Clock, 
  Megaphone, 
  Newspaper, 
  Calendar, 
  Building2, 
  ChevronRight,
  ArrowRight,
  Circle,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SidebarData {
  announcements: Array<{ id: number; title: string | null; createdAt: Date | null }>;
  liveExams: Array<{ id: number; name: string | null; examDate: Date | null }>;
  articles: Array<{ id: number; title: string | null; createdAt: Date | null }>;
}

export function ResultsSidebar({ announcements, liveExams, articles }: SidebarData) {
  return (
    <div className="space-y-6 sticky top-24">
      {/* Live Exams */}
      {liveExams.length > 0 && (
        <Card className="border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-400 dark:from-green-400 dark:to-green-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Live Exams
                  <Badge className="bg-green-600 text-white border-0 animate-pulse">
                    Live
                  </Badge>
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active right now</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveExams.slice(0, 3).map((exam) => (
              <div 
                key={exam.id} 
                className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/50 hover:border-green-200 dark:hover:border-green-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {exam.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {exam.examDate ? format(new Date(exam.examDate), "MMM dd, yyyy") : "Date TBA"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {liveExams.length > 3 && (
              <Link href="/exam" className="block">
                <Button variant="ghost" size="sm" className="w-full text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                  View all live exams
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Announcements */}
      {announcements.length > 0 && (
        <Card className="border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-400 dark:from-yellow-400 dark:to-orange-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Megaphone className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Announcements
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">Latest updates</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.slice(0, 3).map((ann, index) => (
              <div 
                key={ann.id} 
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div className="mt-0.5">
                  <Circle className={`h-2 w-2 fill-yellow-600 text-yellow-600 dark:fill-yellow-400 dark:text-yellow-400 ${index === 0 ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium line-clamp-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                    {ann.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {ann.createdAt ? format(new Date(ann.createdAt), "MMM dd, yyyy") : "Recent"}
                  </p>
                </div>
              </div>
            ))}
            {announcements.length > 3 && (
              <Link href="/announcements" className="block">
                <Button variant="ghost" size="sm" className="w-full text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300">
                  View all announcements
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Recent Articles */}
      {articles.length > 0 && (
        <Card className="border-0 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-400 dark:from-red-500 dark:to-red-600" />
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Newspaper className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Recent Articles
                  <Badge variant="outline" className="text-xs border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                    New
                  </Badge>
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">Helpful resources</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {articles.slice(0, 3).map((article) => (
              <Link 
                key={article.id} 
                href={`/view/${article.id}`} 
                className="block group"
              >
                <div className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 flex-1">
                      {article.title}
                    </p>
                    <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {article.createdAt ? format(new Date(article.createdAt), "MMM dd, yyyy") : "Recent"}
                  </p>
                </div>
              </Link>
            ))}
            {articles.length > 3 && (
              <Link href="/articles" className="block">
                <Button variant="ghost" size="sm" className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                  View all articles
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
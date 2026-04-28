// components/home/ExamStatusSection.tsx
"use client";

import { format } from "date-fns";
import { Clock, Calendar, Trophy, Lock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Exam = {
  id: number;
  name: string | null;
  examDate: Date | null;
  isLive?: boolean | null;
  isClosed?: boolean | null;
  resultAnnounced?: boolean | null;
};

interface ExamStatusSectionProps {
  liveExams: Exam[];
  upcomingExams: Exam[];
  resultExams: Exam[];
}

export function ExamStatusSection({ liveExams, upcomingExams, resultExams }: ExamStatusSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Live Exams */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Live Now</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {liveExams.length > 0 ? (
              liveExams.slice(0, 3).map((exam) => (
                <div key={exam.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.name}</p>
                    {exam.isClosed && (
                      <Badge variant="destructive" className="text-xs">
                        Closed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Started • {exam.examDate ? format(new Date(exam.examDate), "hh:mm a") : "Now"}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                No live exams available
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-yellow-50 dark:bg-yellow-950/20">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Exams
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {upcomingExams.length > 0 ? (
              upcomingExams.slice(0, 3).map((exam) => (
                <div key={exam.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.name}</p>
                    {exam.isClosed && (
                      <Badge variant="destructive" className="text-xs">
                        Closed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {exam.examDate ? format(new Date(exam.examDate), "MMM dd, yyyy") : "Date TBA"}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                No upcoming exams scheduled
              </div>
            )}
          </div>
        </div>

        {/* Result Declared */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-purple-50 dark:bg-purple-950/20">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Results Declared
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {resultExams.length > 0 ? (
              resultExams.slice(0, 3).map((exam) => (
                <div key={exam.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.name}</p>
                    {exam.isClosed && (
                      <Badge variant="secondary" className="text-xs">
                        Archived
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-green-600" />
                    Results available now
                  </p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-xs p-0 h-auto mt-1 text-purple-600 dark:text-purple-400"
                  >
                    View Results →
                  </Button>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                No results declared yet
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
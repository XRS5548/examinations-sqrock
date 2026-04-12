// components/home/HeroSection.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Eye, Calendar, Building2, Search, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Exam = {
  id: number;
  name: string | null;
  examDate: Date | null;
  companyName: string | null;
  isLive: boolean | null;
};

interface HeroSectionProps {
  allExams: Exam[];
}

export function HeroSection({ allExams }: HeroSectionProps) {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "live" | "upcoming">("all");

  const filteredExams = allExams.filter((exam) => {
    const matchesSearch = exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "live") {
      return matchesSearch && exam.isLive === true;
    }
    if (filterStatus === "upcoming") {
      return matchesSearch && exam.isLive === false && exam.examDate && new Date(exam.examDate) > new Date();
    }
    return matchesSearch;
  });

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Hero Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-8 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full inline-block mb-4">
                Trusted by 1000+ companies
              </span>
              <h1 className="text-4xl font-bold mb-4">
                Crack Every Exam.
                <br />
                Every Time.
              </h1>
              <p className="text-red-100 mb-8">
                India's most trusted platform for exam preparation and management.
              </p>
              <button className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                Explore Exams →
              </button>

              {/* badhai */}
              {/* <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-red-500">
                <div>
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-red-100">Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-red-100">Exams</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">200+</div>
                  <div className="text-sm text-red-100">Companies</div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Right Available Exams Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Exams</h2>
              <p className="text-sm text-gray-500 mt-1">Browse through all available exams</p>
              
              {/* Search and Filter */}
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search exams or companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      filterStatus === "all" 
                        ? "bg-red-600 text-white" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus("live")}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      filterStatus === "live" 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    Live
                  </button>
                  <button
                    onClick={() => setFilterStatus("upcoming")}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      filterStatus === "upcoming" 
                        ? "bg-yellow-600 text-white" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    Upcoming
                  </button>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto max-h-[500px]">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <div 
                    key={exam.id} 
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => setSelectedExam(exam)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{exam.name}</h3>
                      {exam.isLive ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Live Now
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {exam.companyName || "Various Companies"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {exam.examDate ? format(new Date(exam.examDate), "MMM dd, yyyy") : "Date TBA"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? "No exams match your search" : "No exams available at the moment"}
                </div>
              )}
            </div>
            
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 text-center">
                Showing {filteredExams.length} of {allExams.length} exams
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Details Dialog */}
      <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedExam?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Building2 className="h-4 w-4" />
              <span>{selectedExam?.companyName || "Various Companies"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>{selectedExam?.examDate ? format(new Date(selectedExam.examDate), "PPP") : "Date to be announced"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Eye className="h-4 w-4" />
              <span>{selectedExam?.isLive ? "Live now - Open for participation" : "Upcoming - Register to participate"}</span>
            </div>
            <button className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all mt-4">
              {selectedExam?.isLive ? "Join Exam Now" : "Get Notified"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
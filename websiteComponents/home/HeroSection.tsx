// websiteComponents/home/HeroSection.tsx
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Eye, Calendar, Building2, Search, ChevronLeft, ChevronRight, Lock, AlertCircle, Bell } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Exam = {
  id: number;
  name: string | null;
  examDate: Date | null;
  isLive?: boolean | null;
  isClosed?: boolean | null;
  resultAnnounced?: boolean | null;
  description?: string | null;
  companyName?: string | null;  // ADD THIS - companyName property
};

interface HeroSectionProps {
  allExams: Exam[];
}

const ITEMS_PER_PAGE = 5;

export function HeroSection({ allExams }: HeroSectionProps) {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "live" | "upcoming" | "closed">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter exams based on search and status
  const filteredExams = useMemo(() => {
    return allExams.filter((exam) => {
      const matchesSearch = exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === "live") {
        return matchesSearch && exam.isLive === true && exam.isClosed === false;
      }
      if (filterStatus === "upcoming") {
        return matchesSearch && exam.isLive === false && exam.isClosed === false && 
               exam.examDate && new Date(exam.examDate) > new Date();
      }
      if (filterStatus === "closed") {
        return matchesSearch && exam.isClosed === true;
      }
      return matchesSearch;
    });
  }, [allExams, searchTerm, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  const handleFilterChange = (newFilter: typeof filterStatus) => {
    setFilterStatus(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getExamStatus = (exam: Exam) => {
    if (exam.isClosed) return { label: "Closed", variant: "destructive" as const, icon: Lock };
    if (exam.isLive) return { label: "Live Now", variant: "default" as const, icon: Eye };
    return { label: "Upcoming", variant: "secondary" as const, icon: Calendar };
  };

  const getActionButton = (exam: Exam) => {
    if (exam.isClosed) {
      return {
        text: "Exam Closed",
        disabled: true,
        variant: "secondary" as const,
        icon: Lock
      };
    }
    if (exam.isLive) {
      return {
        text: "Join Exam Now",
        disabled: false,
        variant: "default" as const,
        icon: Eye
      };
    }
    return {
      text: "Get Notified",
      disabled: false,
      variant: "outline" as const,
      icon: Bell
    };
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Hero Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-8 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              {/* <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full inline-block mb-4">
                Trusted by 1000+ companies
              </span> */}
              <h1 className="text-4xl font-bold mb-4">
                Crack Every Exam.
                <br />
                Every Time.
              </h1>
              <p className="text-red-100 mb-8">
                India&apos;s most trusted platform for exam preparation and management.
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-red-600 hover:bg-red-50"
                onClick={() => document.getElementById("exams-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Exams →
              </Button>
            </div>
          </div>

          {/* Right Available Exams Panel */}
          <div id="exams-section" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Exams</h2>
              <p className="text-sm text-gray-500 mt-1">Browse through all available exams</p>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search exams or companies..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  <Button
                    onClick={() => handleFilterChange("all")}
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    className={filterStatus === "all" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    All
                  </Button>
                  <Button
                    onClick={() => handleFilterChange("live")}
                    variant={filterStatus === "live" ? "default" : "outline"}
                    size="sm"
                    className={filterStatus === "live" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    Live
                  </Button>
                  <Button
                    onClick={() => handleFilterChange("upcoming")}
                    variant={filterStatus === "upcoming" ? "default" : "outline"}
                    size="sm"
                    className={filterStatus === "upcoming" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                  >
                    Upcoming
                  </Button>
                  <Button
                    onClick={() => handleFilterChange("closed")}
                    variant={filterStatus === "closed" ? "default" : "outline"}
                    size="sm"
                    className={filterStatus === "closed" ? "bg-gray-600 hover:bg-gray-700" : ""}
                  >
                    Closed
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto max-h-[500px]">
              {paginatedExams.length > 0 ? (
                paginatedExams.map((exam) => {
                  const status = getExamStatus(exam);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div 
                      key={exam.id} 
                      className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group ${
                        exam.isClosed ? 'opacity-75' : ''
                      }`}
                      onClick={() => setSelectedExam(exam)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-1">
                          {exam.name || "Untitled Exam"}
                        </h3>
                        <Badge variant={status.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{exam.companyName || "Various Companies"}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar className="h-3 w-3" />
                          {exam.examDate ? format(new Date(exam.examDate), "MMM dd, yyyy") : "Date TBA"}
                        </span>
                      </div>
                      {exam.isClosed && (
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Registration closed for this exam
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">{searchTerm ? "No exams match your search" : "No exams available at the moment"}</p>
                  {searchTerm && (
                    <Button
                      onClick={() => setSearchTerm("")}
                      variant="link"
                      className="mt-2 text-red-600"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredExams.length)} of {filteredExams.length} exams
                  </p>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={`h-7 w-7 p-0 ${currentPage === pageNum ? 'bg-red-600 hover:bg-red-700' : ''}`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Exam Details Dialog */}
      <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedExam?.name || "Exam Details"}</DialogTitle>
            {selectedExam?.isClosed && (
              <DialogDescription className="text-red-600 dark:text-red-400 flex items-center gap-2 mt-2">
                <Lock className="h-4 w-4" />
                This exam is currently closed for registration
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="break-words">{selectedExam?.companyName || "Various Companies"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{selectedExam?.examDate ? format(new Date(selectedExam.examDate), "PPP") : "Date to be announced"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              {selectedExam?.isClosed ? (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Exam is closed - No longer accepting submissions</span>
                </>
              ) : selectedExam?.isLive ? (
                <>
                  <Eye className="h-4 w-4 text-green-600" />
                  <span>Live now - Open for participation</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 text-yellow-600" />
                  <span>Upcoming - Register to participate</span>
                </>
              )}
            </div>
            {selectedExam?.description && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedExam.description}
                </p>
              </div>
            )}
            {selectedExam && (() => {
              const action = getActionButton(selectedExam);
              return (
                <Link href={!selectedExam.isClosed && selectedExam.isLive ? "/join" : "#GetNotified"} className="w-full">
                  <Button 
                    className="w-full"
                    variant={action.variant}
                    disabled={action.disabled}
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.text}
                  </Button>
                </Link>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
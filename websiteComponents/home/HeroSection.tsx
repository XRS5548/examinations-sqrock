// websiteComponents/home/HeroSection.tsx
"use client";

import { useState, useMemo } from "react";
import { format, isAfter, isBefore, isToday, parseISO, addDays, subDays } from "date-fns";
import { Eye, Calendar, Building2, Search, ChevronLeft, ChevronRight, Lock, AlertCircle, FileText, Clock, Users } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

type Exam = {
  id: number;
  name: string | null;
  examDate: Date | null;
  isLive?: boolean | null;
  isClosed?: boolean | null;
  resultAnnounced?: boolean | null;
  description?: string | null;
  companyName?: string | null;
  durationMinutes?: number | null;
  totalMarks?: number | null;
  isPublic?: boolean | null;
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

  // Helper function to get the display date (one day before actual date)
  const getDisplayDate = (examDate: Date | null): Date | null => {
    if (!examDate) return null;
    try {
      const date = new Date(examDate);
      // Subtract one day
      return subDays(date, 1);
    } catch (error) {
      return null;
    }
  };

  // Helper function to check if exam is upcoming (using actual date)
  const isExamUpcoming = (exam: Exam) => {
    if (!exam.examDate) return false;
    const examDate = new Date(exam.examDate);
    const today = new Date();
    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    return isAfter(examDate, today) || isToday(examDate);
  };

  // Filter exams based on search and status
  const filteredExams = useMemo(() => {
    return allExams.filter((exam) => {
      const matchesSearch = exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exam.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === "live") {
        return matchesSearch && exam.isLive === true && exam.isClosed === false;
      }
      if (filterStatus === "upcoming") {
        return matchesSearch && exam.isLive === false && exam.isClosed === false && isExamUpcoming(exam);
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
    if (isExamUpcoming(exam)) return { label: "Upcoming", variant: "secondary" as const, icon: Calendar };
    return { label: "Past", variant: "outline" as const, icon: Calendar };
  };

  const getActionButton = (exam: Exam) => {
    if (exam.isClosed) {
      return {
        text: "Exam Closed",
        disabled: true,
        variant: "secondary" as const,
        icon: Lock,
        href: "#"
      };
    }
    if (exam.isLive) {
      return {
        text: "Join Exam Now",
        disabled: false,
        variant: "default" as const,
        icon: Eye,
        href: `/exam-registration`
      };
    }
    // All upcoming exams - show register now button
    return {
      text: "Register Now",
      disabled: false,
      variant: "default" as const,
      icon: FileText,
      href: "/exam-registration"
    };
  };

  // Format date function with proper handling - shows one day before
  const formatExamDate = (date: Date | null) => {
    if (!date) return "Date TBA";
    try {
      const displayDate = getDisplayDate(date);
      if (!displayDate) return "Date TBA";
      return format(displayDate, "MMM dd, yyyy");
    } catch (error) {
      return "Date TBA";
    }
  };

  const formatFullDate = (date: Date | null) => {
    if (!date) return "Date to be announced";
    try {
      const displayDate = getDisplayDate(date);
      if (!displayDate) return "Date to be announced";
      return format(displayDate, "PPP");
    } catch (error) {
      return "Date to be announced";
    }
  };

  // Get actual date for display (if needed)
  const getActualDate = (date: Date | null) => {
    if (!date) return null;
    try {
      return format(new Date(date), "PPP");
    } catch (error) {
      return null;
    }
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Hero Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-8 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
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
            
            <ScrollArea className="flex-1 max-h-[500px]">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
                            {formatExamDate(exam.examDate)}
                          </span>
                        </div>
                        {exam.isClosed && (
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Registration closed for this exam
                          </p>
                        )}
                        {!exam.isClosed && exam.isPublic && isExamUpcoming(exam) && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Open for registration
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
            </ScrollArea>
            
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white break-words flex-1">
                {selectedExam?.name || "Exam Details"}
              </DialogTitle>
              {selectedExam && (
                <Badge variant={selectedExam.isClosed ? "destructive" : selectedExam.isLive ? "default" : "secondary"} className="shrink-0">
                  {selectedExam.isClosed ? (
                    <><Lock className="h-3 w-3 mr-1" /> Closed</>
                  ) : selectedExam.isLive ? (
                    <><Eye className="h-3 w-3 mr-1" /> Live</>
                  ) : (
                    <><Calendar className="h-3 w-3 mr-1" /> Upcoming</>
                  )}
                </Badge>
              )}
            </div>
            {selectedExam?.isClosed && (
              <DialogDescription className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                This exam is currently closed for registration
              </DialogDescription>
            )}
            {!selectedExam?.isClosed && selectedExam?.isPublic && (
              <DialogDescription className="text-green-600 dark:text-green-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Open for registration - Register now to participate!
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="space-y-6 py-2">
            {/* Company & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                    {selectedExam?.companyName || "Various Companies"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Exam Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatFullDate(selectedExam?.examDate || null)}
                  </p>
                  {/* Show actual date in small text */}
                  {selectedExam?.examDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Closed: {getActualDate(selectedExam.examDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedExam?.durationMinutes && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedExam.durationMinutes} minutes
                    </p>
                  </div>
                </div>
              )}
              {selectedExam?.totalMarks && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Users className="h-4 w-4 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Marks</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedExam.totalMarks}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedExam?.description && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedExam.description}
                </p>
              </div>
            )}

            {/* Status Message */}
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                {selectedExam?.isClosed ? (
                  <>
                    <Lock className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">
                      Exam is closed - No longer accepting submissions
                    </span>
                  </>
                ) : selectedExam?.isLive ? (
                  <>
                    <Eye className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">
                      Live now - Open for participation
                    </span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400">
                      Registration open - Click the button below to register
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Button */}
            {selectedExam && (() => {
              const action = getActionButton(selectedExam);
              return (
                <Link href={action.href} className="w-full block">
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
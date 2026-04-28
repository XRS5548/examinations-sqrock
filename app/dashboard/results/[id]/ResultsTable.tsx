// components/dashboard/results/ResultsTable.tsx
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Filter, Download, Settings, Trophy, ArrowUpDown, Crown, Medal, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ResultDetailsDialog } from "./ResultDetailsDialog";
import { StudentLogsDialog } from "./StudentLogsDialog";
import { evaluateMCQForRegistration } from "@/actions/results2";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Registration = {
  id: number;
  examId: number;
  studentId: number;
  rollNumber: string | null;
  score: number;
  cheating: boolean;
  status: string | null;
  submittedAt: Date | null;
  studentName: string;
  studentEmail: string;
  examName: string;
  examTotalMarks: number;
  examResultAnnounced: boolean;
};

type SortOption = "rank" | "name" | "score" | "percentage" | "submittedAt";

interface ResultsTableProps {
  initialRegistrations: Registration[];
}

export function ResultsTable({ initialRegistrations }: ResultsTableProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [selectedLogsRegistration, setSelectedLogsRegistration] = useState<{
    id: number;
    studentName: string;
    examName: string;
  } | null>(null);
  const [evaluating, setEvaluating] = useState<number | null>(null);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [eligibilityPercentage, setEligibilityPercentage] = useState<number>(40);
  const [topN, setTopN] = useState<number | null>(null);
  const [showTopOnly, setShowTopOnly] = useState(false);

  const getStatus = (registration: Registration) => {
    if (registration.cheating) return "cheating";
    const percentage = registration.examTotalMarks > 0 
      ? (registration.score / registration.examTotalMarks) * 100 
      : 0;
    if (percentage >= eligibilityPercentage) return "pass";
    return "fail";
  };

  const getStatusBadge = (registration: Registration) => {
    const status = getStatus(registration);
    switch (status) {
      case "pass":
        return <Badge className="bg-green-600">Eligible</Badge>;
      case "fail":
        return <Badge variant="destructive">Not Eligible</Badge>;
      case "cheating":
        return <Badge variant="destructive">Cheating</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getEligibilityClass = (registration: Registration) => {
    if (registration.cheating) return "text-red-600";
    const percentage = registration.examTotalMarks > 0 
      ? (registration.score / registration.examTotalMarks) * 100 
      : 0;
    if (percentage >= eligibilityPercentage) return "text-green-600 font-semibold";
    return "text-red-600";
  };

  // Calculate rank for each registration
  const registrationsWithRank = useMemo(() => {
    // Filter out cheating students from ranking
    const validRegistrations = registrations.filter(reg => !reg.cheating && reg.submittedAt);
    
    // Sort by score (highest first) for ranking
    const sortedByScore = [...validRegistrations].sort((a, b) => {
      const percentageA = a.examTotalMarks > 0 ? (a.score / a.examTotalMarks) * 100 : 0;
      const percentageB = b.examTotalMarks > 0 ? (b.score / b.examTotalMarks) * 100 : 0;
      return percentageB - percentageA;
    });

    // Assign ranks
    const rankMap = new Map<number, number>();
    let currentRank = 1;
    let prevPercentage = -1;
    
    sortedByScore.forEach((reg, index) => {
      const percentage = reg.examTotalMarks > 0 ? (reg.score / reg.examTotalMarks) * 100 : 0;
      if (prevPercentage !== percentage && index > 0) {
        currentRank = index + 1;
      }
      rankMap.set(reg.id, currentRank);
      prevPercentage = percentage;
    });

    return registrations.map(reg => ({
      ...reg,
      rank: reg.cheating || !reg.submittedAt ? null : rankMap.get(reg.id) || null,
    }));
  }, [registrations]);

  // Sort registrations based on selected option
  const sortedRegistrations = useMemo(() => {
    const filtered = registrationsWithRank.filter(reg => {
      const matchesSearch = reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reg.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reg.examName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || getStatus(reg) === statusFilter;
      return matchesSearch && matchesStatus;
    });

    let sorted = [...filtered];

    switch (sortOption) {
      case "rank":
        sorted.sort((a, b) => {
          if (a.rank === null && b.rank === null) return 0;
          if (a.rank === null) return 1;
          if (b.rank === null) return -1;
          return sortOrder === "desc" ? a.rank - b.rank : b.rank - a.rank;
        });
        break;
      case "name":
        sorted.sort((a, b) => {
          const comparison = a.studentName.localeCompare(b.studentName);
          return sortOrder === "desc" ? -comparison : comparison;
        });
        break;
      case "score":
        sorted.sort((a, b) => {
          const comparison = b.score - a.score;
          return sortOrder === "desc" ? comparison : -comparison;
        });
        break;
      case "percentage":
        sorted.sort((a, b) => {
          const percentageA = a.examTotalMarks > 0 ? (a.score / a.examTotalMarks) * 100 : 0;
          const percentageB = b.examTotalMarks > 0 ? (b.score / b.examTotalMarks) * 100 : 0;
          const comparison = percentageB - percentageA;
          return sortOrder === "desc" ? comparison : -comparison;
        });
        break;
      case "submittedAt":
        sorted.sort((a, b) => {
          if (!a.submittedAt && !b.submittedAt) return 0;
          if (!a.submittedAt) return 1;
          if (!b.submittedAt) return -1;
          const comparison = new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
          return sortOrder === "desc" ? comparison : -comparison;
        });
        break;
    }

    // Apply top N filter
    if (showTopOnly && topN && topN > 0) {
      const topRanked = sorted.filter(reg => reg.rank !== null && reg.rank <= topN);
      return topRanked;
    }

    return sorted;
  }, [registrationsWithRank, searchTerm, statusFilter, sortOption, sortOrder, showTopOnly, topN]);

  const getRankIcon = (rank: number | null) => {
    if (!rank) return null;
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500 inline mr-1" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400 inline mr-1" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600 inline mr-1" />;
    return <span className="text-muted-foreground text-xs mr-1">#{rank}</span>;
  };

  const handleSort = (option: SortOption) => {
    if (sortOption === option) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortOption(option);
      setSortOrder("desc");
    }
  };

  const handleAutoEvaluate = async (registrationId: number) => {
    setEvaluating(registrationId);
    try {
      const result = await evaluateMCQForRegistration(registrationId);
      if (result.success) {
        toast.success("MCQ questions evaluated successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to evaluate");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setEvaluating(null);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Rank",
      "S.No",
      "Roll Number",
      "Student Name",
      "Student Email",
      "Exam Name",
      "Score",
      "Total Marks",
      "Percentage",
      "Status",
      "Eligibility",
      "Submitted At"
    ];

    const rows = sortedRegistrations.map((registration, index) => {
      const percentage = registration.examTotalMarks > 0 
        ? (registration.score / registration.examTotalMarks) * 100 
        : 0;
      const status = getStatus(registration);
      const eligibility = status === "pass" ? "Eligible" : "Not Eligible";
      
      return [
        registration.rank || "N/A",
        index + 1,
        registration.rollNumber || "N/A",
        registration.studentName,
        registration.studentEmail,
        registration.examName,
        registration.cheating ? 0 : registration.score,
        registration.examTotalMarks,
        percentage.toFixed(2) + "%",
        registration.cheating ? "Cheating Detected" : (status === "pass" ? "Pass" : "Fail"),
        eligibility,
        registration.submittedAt 
          ? format(new Date(registration.submittedAt), "MMM dd, yyyy HH:mm:ss")
          : "Not Submitted"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => 
          typeof cell === "string" && (cell.includes(",") || cell.includes('"')) 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(",")
      )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `exam_results_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Results exported successfully!");
  };

  const updateEligibilityCriteria = () => {
    setEligibilityDialogOpen(false);
    toast.success(`Eligibility criteria updated to ${eligibilityPercentage}%`);
    setRegistrations([...registrations]);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const validRegistrations = registrations.filter(reg => !reg.cheating && reg.submittedAt);
    const averageScore = validRegistrations.length > 0
      ? validRegistrations.reduce((sum, reg) => sum + reg.score, 0) / validRegistrations.length
      : 0;
    const highestScore = Math.max(...validRegistrations.map(reg => reg.score), 0);
    const totalStudents = registrations.length;
    const eligibleCount = registrations.filter(reg => getStatus(reg) === "pass").length;
    
    return {
      averageScore: averageScore.toFixed(1),
      highestScore,
      totalStudents,
      eligibleCount,
      eligiblePercentage: totalStudents > 0 ? ((eligibleCount / totalStudents) * 100).toFixed(1) : 0,
    };
  }, [registrations]);

  return (
    <>
      <div className="space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Total Students</div>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Average Score</div>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Eligible Students</div>
            <div className="text-2xl font-bold">{stats.eligibleCount} ({stats.eligiblePercentage}%)</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Highest Score</div>
            <div className="text-2xl font-bold">{stats.highestScore}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student or exam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="pass">Eligible</SelectItem>
                <SelectItem value="fail">Not Eligible</SelectItem>
                <SelectItem value="cheating">Cheating</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="name">Student Name</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="submittedAt">Submission Date</SelectItem>
              </SelectContent>
            </Select>

            {/* Top N Filter */}
            <div className="flex items-center gap-2">
              <Button
                variant={showTopOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTopOnly(!showTopOnly)}
                className={showTopOnly ? "bg-gradient-to-r from-yellow-500 to-orange-500" : ""}
              >
                <Crown className="h-4 w-4 mr-2" />
                Top Ranks
              </Button>
              {showTopOnly && (
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={topN || 10}
                  onChange={(e) => setTopN(parseInt(e.target.value) || 10)}
                  className="w-20 h-9"
                  placeholder="N"
                />
              )}
            </div>

            {/* Sort Order Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="h-9"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === "desc" ? "Descending" : "Ascending"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setEligibilityDialogOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Set Criteria ({eligibilityPercentage}%)
            </Button>
            <Button
              variant="default"
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("rank")}
                    className="p-0 h-auto font-semibold"
                  >
                    Rank
                    {sortOption === "rank" && (
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>S.No</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="p-0 h-auto font-semibold"
                  >
                    Student Name
                    {sortOption === "name" && (
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Exam Name</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("score")}
                    className="p-0 h-auto font-semibold"
                  >
                    Score
                    {sortOption === "score" && (
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("percentage")}
                    className="p-0 h-auto font-semibold"
                  >
                    Percentage
                    {sortOption === "percentage" && (
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Status/Eligibility</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("submittedAt")}
                    className="p-0 h-auto font-semibold"
                  >
                    Submitted At
                    {sortOption === "submittedAt" && (
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRegistrations.map((registration, index) => {
                const percentage = registration.examTotalMarks > 0 
                  ? (registration.score / registration.examTotalMarks) * 100 
                  : 0;
                const status = getStatus(registration);
                const eligibilityClass = getEligibilityClass(registration);
                
                return (
                  <TableRow 
                    key={registration.id}
                    className={cn(
                      registration.rank === 1 && "bg-yellow-50 dark:bg-yellow-950/20",
                      registration.rank === 2 && "bg-gray-50 dark:bg-gray-950/20",
                      registration.rank === 3 && "bg-amber-50 dark:bg-amber-950/20"
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getRankIcon(registration.rank)}
                        <span>{registration.rank || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {registration.studentName}
                    </TableCell>
                    <TableCell>{registration.studentEmail}</TableCell>
                    <TableCell>{registration.examName}</TableCell>
                    <TableCell>
                      {registration.cheating ? "0" : registration.score} / {registration.examTotalMarks}
                    </TableCell>
                    <TableCell className={eligibilityClass}>
                      {percentage.toFixed(1)}%
                    </TableCell>
                    <TableCell>{getStatusBadge(registration)}</TableCell>
                    <TableCell>
                      {registration.submittedAt
                        ? format(new Date(registration.submittedAt), "MMM dd, yyyy HH:mm")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedRegistration(registration)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLogsRegistration({
                            id: registration.id,
                            studentName: registration.studentName,
                            examName: registration.examName,
                          })}
                          title="View Logs"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {sortedRegistrations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No results found
          </div>
        )}

        {/* Rank Summary */}
        {sortedRegistrations.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">
              Showing {sortedRegistrations.length} of {registrations.length} total students
              {showTopOnly && topN && ` (Top ${topN} by rank)`}
            </div>
          </div>
        )}
      </div>

      {/* Eligibility Criteria Dialog */}
      <Dialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Eligibility Criteria</DialogTitle>
            <DialogDescription>
              Set the minimum percentage required for a student to be marked as eligible.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="percentage" className="text-right">
                Percentage (%)
              </Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                step="5"
                value={eligibilityPercentage}
                onChange={(e) => setEligibilityPercentage(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Students scoring {eligibilityPercentage}% or above will be marked as <span className="text-green-600 font-semibold">"Eligible"</span>
              <br />
              Students scoring below {eligibilityPercentage}% will be marked as <span className="text-red-600 font-semibold">"Not Eligible"</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEligibilityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateEligibilityCriteria}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Details Dialog */}
      {selectedRegistration && (
        <ResultDetailsDialog
          registration={selectedRegistration}
          open={!!selectedRegistration}
          onOpenChange={() => setSelectedRegistration(null)}
          onUpdate={() => window.location.reload()}
        />
      )}

      {/* Student Logs Dialog */}
      {selectedLogsRegistration && (
        <StudentLogsDialog
          registrationId={selectedLogsRegistration.id}
          studentName={selectedLogsRegistration.studentName}
          examName={selectedLogsRegistration.examName}
          open={!!selectedLogsRegistration}
          onOpenChange={() => setSelectedLogsRegistration(null)}
        />
      )}
    </>
  );
}
// components/dashboard/results/ResultsTable.tsx
"use client";

import { useState } from "react";
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
import { Search, Eye, Filter, Download, Settings } from "lucide-react";
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
import { evaluateMCQForRegistration } from "@/actions/results2";
import { toast } from "sonner";

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

interface ResultsTableProps {
  initialRegistrations: Registration[];
}

export function ResultsTable({ initialRegistrations }: ResultsTableProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [evaluating, setEvaluating] = useState<number | null>(null);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [eligibilityPercentage, setEligibilityPercentage] = useState<number>(40);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

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

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.examName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || getStatus(reg) === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    // Prepare CSV data
    const headers = [
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

    const rows = filteredRegistrations.map((registration, index) => {
      const percentage = registration.examTotalMarks > 0 
        ? (registration.score / registration.examTotalMarks) * 100 
        : 0;
      const status = getStatus(registration);
      const eligibility = status === "pass" ? "Eligible" : "Not Eligible";
      const eligibilityColor = status === "pass" ? "GREEN" : "RED";
      
      return [
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

    // Create CSV content
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

    // Add BOM for UTF-8 encoding
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
    // Force re-render to update status badges
    setRegistrations([...registrations]);
  };

  return (
    <>
      <div className="space-y-4">
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
                <TableHead>S.No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Exam Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status/Eligibility</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration,index) => {
                const percentage = registration.examTotalMarks > 0 
                  ? (registration.score / registration.examTotalMarks) * 100 
                  : 0;
                const status = getStatus(registration);
                const eligibilityClass = getEligibilityClass(registration);
                
                return (
                  <TableRow key={registration.id}>
                    <TableCell>{index+1}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRegistration(registration)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No results found
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

      {selectedRegistration && (
        <ResultDetailsDialog
          registration={selectedRegistration}
          open={!!selectedRegistration}
          onOpenChange={() => setSelectedRegistration(null)}
          onUpdate={() => window.location.reload()}
        />
      )}
    </>
  );
}
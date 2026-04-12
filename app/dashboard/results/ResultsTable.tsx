// components/dashboard/results/ResultsTable.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Search, Eye, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const getStatus = (registration: Registration) => {
    if (registration.cheating) return "cheating";
    const percentage = registration.examTotalMarks > 0 
      ? (registration.score / registration.examTotalMarks) * 100 
      : 0;
    if (percentage >= 40) return "pass";
    return "fail";
  };

  const getStatusBadge = (registration: Registration) => {
    const status = getStatus(registration);
    switch (status) {
      case "pass":
        return <Badge className="bg-green-600">Pass</Badge>;
      case "fail":
        return <Badge variant="destructive">Fail</Badge>;
      case "cheating":
        return <Badge variant="destructive">Cheating</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
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
        // Refresh the registration data
        const updatedReg = registrations.find(r => r.id === registrationId);
        if (updatedReg) {
          // Re-fetch or update local state
          window.location.reload();
        }
      } else {
        toast.error(result.error || "Failed to evaluate");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setEvaluating(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
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
              <SelectItem value="pass">Passed</SelectItem>
              <SelectItem value="fail">Failed</SelectItem>
              <SelectItem value="cheating">Cheating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Exam Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((registration) => {
                const percentage = registration.examTotalMarks > 0 
                  ? (registration.score / registration.examTotalMarks) * 100 
                  : 0;
                const status = getStatus(registration);
                
                return (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.studentName}
                    </TableCell>
                    <TableCell>{registration.studentEmail}</TableCell>
                    <TableCell>{registration.examName}</TableCell>
                    <TableCell>
                      {registration.cheating ? "0" : registration.score} / {registration.examTotalMarks}
                    </TableCell>
                    <TableCell>
                      <span className={percentage >= 40 ? "text-green-600" : "text-red-600"}>
                        {percentage.toFixed(1)}%
                      </span>
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
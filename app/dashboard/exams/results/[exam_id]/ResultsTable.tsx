// components/dashboard/exams/results/ResultsTable.tsx
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Crown, Medal } from "lucide-react";
import { calculateResults } from "@/actions/results";
import { toast } from "sonner";

type Registration = {
  id: number;
  examId: number;
  studentId: number;
  rollNumber: string | null;
  score: number;
  cheating: boolean;
  status: string | null;
  startedAt: Date | null;
  submittedAt: Date | null;
  studentName: string | null;
  studentEmail: string | null;
  studentDob: Date | null;
  studentPhone: string | null;
};

interface ResultsTableProps {
  examId: number;
  registrations: Registration[];
  passingMarks: number;
  totalMarks: number;
}

export function ResultsTable({
  examId,
  registrations,
  passingMarks,
  totalMarks,
}: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [calculating, setCalculating] = useState(false);

  const filteredRegistrations = registrations.filter(reg =>
    reg.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCalculateResults = async () => {
    setCalculating(true);
    try {
      const result = await calculateResults(examId);
      if (result.success) {
        toast.success("Results calculated successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to calculate results");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setCalculating(false);
    }
  };

  const getStatusBadge = (registration: Registration) => {
    if (registration.cheating) {
      return <Badge variant="destructive">Cheating Detected</Badge>;
    }
    
    const score = registration.score || 0;
    if (score >= passingMarks) {
      return <Badge className="bg-green-600">Pass</Badge>;
    }
    
    return <Badge variant="secondary">Fail</Badge>;
  };

  const getScoreColor = (registration: Registration) => {
    if (registration.cheating) return "text-red-600";
    const score = registration.score || 0;
    if (score >= passingMarks) return "text-green-600 font-bold";
    return "text-red-600";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Medal className="h-4 w-4 text-amber-600" />;
    return null;
  };

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No results available</h3>
        <p className="text-muted-foreground mt-2">
          No students have taken this exam yet
        </p>
        <Button
          onClick={handleCalculateResults}
          disabled={calculating}
          className="mt-4"
        >
          {calculating ? "Calculating..." : "Calculate Results"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleCalculateResults}
          disabled={calculating}
        >
          {calculating ? "Calculating..." : "Recalculate Scores"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Roll Number</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Percentage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations.map((registration, index) => {
              const score = registration.score || 0;
              const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
              
              return (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {getRankIcon(index)}
                      <span>{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {registration.rollNumber || "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {registration.studentName || "—"}
                  </TableCell>
                  <TableCell>{registration.studentEmail || "—"}</TableCell>
                  <TableCell className={`text-center ${getScoreColor(registration)}`}>
                    {registration.cheating ? "0" : score} / {totalMarks}
                  </TableCell>
                  <TableCell className="text-center">
                    {registration.cheating ? (
                      "0%"
                    ) : (
                      <span className={percentage >= 40 ? "text-green-600" : "text-red-600"}>
                        {percentage.toFixed(1)}%
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(registration)}</TableCell>
                  <TableCell>
                    {registration.submittedAt
                      ? format(new Date(registration.submittedAt), "MMM dd, yyyy HH:mm")
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredRegistrations.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          No results found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}

// Add missing import
import { Users } from "lucide-react";
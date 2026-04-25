// components/dashboard/exams/students/AssignedStudentsTable.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, AlertCircle, Download } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeStudentFromExam } from "@/actions/examStudents"; 
import { toast } from "sonner";

type Assignment = {
  id: number;
  examId: number;
  studentId: number;
  rollNumber: string | null;
  status: "not_started" | "in_progress" | "completed" | "failed" | null;
  cheating: boolean | null;
  startedAt: Date | null;
  submittedAt: Date | null;
  student: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

interface AssignedStudentsTableProps {
  examId: number;
  initialAssignments: Assignment[];
}

export function AssignedStudentsTable({
  examId,
  initialAssignments,
}: AssignedStudentsTableProps) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRemove = async (registrationId: number) => {
    setLoading(true);
    try {
      const result = await removeStudentFromExam(registrationId);

      if (result.success) {
        toast.success("Student removed from exam");
        setAssignments(assignments.filter(a => a.id !== registrationId));
        setRemovingId(null);
      } else {
        toast.error(result.error || "Failed to remove student");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600">In Progress</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      "S.No",
      "Roll Number",
      "Student Name",
      "Email",
      "Phone",
      "Status",
      "Cheating Status",
      "Started At",
      "Submitted At"
    ];

    // Prepare CSV rows
    const rows = assignments.map((assignment, index) => {
      let statusText = "Not Started";
      switch (assignment.status) {
        case "completed":
          statusText = "Completed";
          break;
        case "in_progress":
          statusText = "In Progress";
          break;
        case "failed":
          statusText = "Failed";
          break;
        default:
          statusText = "Not Started";
      }

      return [
        index + 1,
        assignment.rollNumber || "N/A",
        assignment.student?.name || "N/A",
        assignment.student?.email || "N/A",
        assignment.student?.phone || "N/A",
        statusText,
        assignment.cheating ? "Flagged for Cheating" : "Clean",
        assignment.startedAt 
          ? format(new Date(assignment.startedAt), "MMM dd, yyyy HH:mm:ss")
          : "Not Started",
        assignment.submittedAt 
          ? format(new Date(assignment.submittedAt), "MMM dd, yyyy HH:mm:ss")
          : "Not Submitted"
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => 
          typeof cell === "string" && (cell.includes(",") || cell.includes('"') || cell.includes("\n"))
            ? `"${cell.replace(/"/g, '""').replace(/\n/g, ' ')}"`
            : cell
        ).join(",")
      )
    ].join("\n");

    // Download CSV file
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `assigned_students_exam_${examId}_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${assignments.length} students to CSV`);
  };

  const exportToJSON = () => {
    const exportData = assignments.map(assignment => ({
      rollNumber: assignment.rollNumber,
      studentName: assignment.student?.name,
      studentEmail: assignment.student?.email,
      studentPhone: assignment.student?.phone,
      status: assignment.status,
      cheating: assignment.cheating,
      startedAt: assignment.startedAt,
      submittedAt: assignment.submittedAt,
    }));

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `assigned_students_exam_${examId}_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${assignments.length} students to JSON`);
  };

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No students assigned</h3>
        <p className="text-muted-foreground mt-2">
          Select students from the left panel to assign them to this exam
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total Assigned: {assignments.length} students
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cheating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-mono text-sm">
                    {assignment.rollNumber || "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {assignment.student?.name || "—"}
                  </TableCell>
                  <TableCell>{assignment.student?.email || "—"}</TableCell>
                  <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                  <TableCell>
                    {assignment.cheating ? (
                      <Badge variant="destructive">Flagged</Badge>
                    ) : (
                      <Badge variant="outline">Clean</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemovingId(assignment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!removingId} onOpenChange={() => setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this student from the exam?
              This will delete all their progress and answers for this exam.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingId && handleRemove(removingId)}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Removing..." : "Remove Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
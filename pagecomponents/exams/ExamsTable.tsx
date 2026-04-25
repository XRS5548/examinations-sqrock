// components/dashboard/exams/ExamsTable.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Play, Pause, Eye, FileText, Users, BarChart3, Trophy } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EditExamDialog } from "./EditExamDialog"; 
import { DeleteExamDialog } from "./DeleteExamDialog"; 
import { toggleExamLive, toggleResultAnnounced } from "@/actions/exams";
import { toast } from "sonner";

export type Exam = {
  id: number;
  name: string | null;
  description: string | null;
  examDate: Date | null;
  durationMinutes: number | null;
  totalMarks: number | null;
  isLive: boolean;
  resultAnnounced: boolean;
  syllabusPdf: string | null;
  coverImage: string | null;
};

interface ExamsTableProps {
  initialExams: Exam[];
}

export function ExamsTable({ initialExams }: ExamsTableProps) {
  const [exams, setExams] = useState(initialExams);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedExamForResult, setSelectedExamForResult] = useState<Exam | null>(null);

  const handleToggleLive = async (id: number, currentStatus: boolean) => {
    try {
      const result = await toggleExamLive(id, !currentStatus);
      if (result.success) {
        setExams(exams.map(exam => 
          exam.id === id ? { ...exam, isLive: !currentStatus } : exam
        ));
        toast.success(`Exam is now ${!currentStatus ? 'live' : 'offline'}`);
      } else {
        toast.error(result.error || "Failed to toggle exam status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleToggleResult = async (id: number, currentStatus: boolean) => {
    try {
      const result = await toggleResultAnnounced(id, !currentStatus);
      if (result.success) {
        setExams(exams.map(exam => 
          exam.id === id ? { ...exam, resultAnnounced: !currentStatus } : exam
        ));
        toast.success(`Results ${!currentStatus ? 'announced' : 'unannounced'} successfully`);
        setResultDialogOpen(false);
        setSelectedExamForResult(null);
      } else {
        toast.error(result.error || "Failed to update result status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const openResultDialog = (exam: Exam) => {
    setSelectedExamForResult(exam);
    setResultDialogOpen(true);
  };

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No exams created yet</h3>
        <p className="text-muted-foreground mt-2">
          Get started by creating your first exam
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Results</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.name || "Untitled"}</TableCell>
                <TableCell>
                  {exam.examDate 
                    ? format(new Date(exam.examDate), "MMM dd, yyyy")
                    : "Not set"}
                </TableCell>
                <TableCell>
                  {exam.durationMinutes 
                    ? `${exam.durationMinutes} min`
                    : "Not set"}
                </TableCell>
                <TableCell>
                  {exam.totalMarks || "Not set"}
                </TableCell>
                <TableCell>
                  <Badge variant={exam.isLive ? "default" : "secondary"}>
                    {exam.isLive ? "Live" : "Not Live"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {exam.resultAnnounced ? (
                    <Badge className="bg-green-600">Results Declared</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setEditingExam(exam)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleLive(exam.id, exam.isLive)}>
                        {exam.isLive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Make Offline
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Make Live
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openResultDialog(exam)}>
                        <Trophy className="mr-2 h-4 w-4" />
                        {exam.resultAnnounced ? "Unpublish Results" : "Publish Results"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeletingExam(exam)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditExamDialog
        exam={editingExam}
        open={!!editingExam}
        onOpenChange={(open) => !open && setEditingExam(null)}
        onExamUpdated={(updatedExam) => {
          setExams(exams.map(e => e.id === updatedExam.id ? updatedExam : e));
          setEditingExam(null);
        }}
      />

      <DeleteExamDialog
        exam={deletingExam}
        open={!!deletingExam}
        onOpenChange={(open) => !open && setDeletingExam(null)}
        onExamDeleted={(examId) => {
          setExams(exams.filter(e => e.id !== examId));
          setDeletingExam(null);
        }}
      />

      {/* Result Announcement Confirmation Dialog */}
      <AlertDialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedExamForResult?.resultAnnounced ? "Unpublish Results" : "Publish Results"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedExamForResult?.resultAnnounced ? (
                <>
                  Are you sure you want to unpublish results for <strong>{selectedExamForResult?.name}</strong>?
                  This will make results hidden from students again.
                </>
              ) : (
                <>
                  Are you sure you want to publish results for <strong>{selectedExamForResult?.name}</strong>?
                  <br /><br />
                  <strong>Note:</strong> Please ensure all answers have been evaluated before publishing results.
                  Once published, students will be able to view their results.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedExamForResult && handleToggleResult(
                selectedExamForResult.id, 
                selectedExamForResult.resultAnnounced
              )}
              className={selectedExamForResult?.resultAnnounced ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
            >
              {selectedExamForResult?.resultAnnounced ? "Unpublish Results" : "Publish Results"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
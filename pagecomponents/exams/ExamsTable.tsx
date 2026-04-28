// components/dashboard/exams/ExamsTable.tsx
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Play, Pause, Eye, FileText, Users, BarChart3, Trophy, Lock, LockOpen, Globe, Globe2 } from "lucide-react";
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
import { toggleExamLive, toggleResultAnnounced, toggleExamClosed, toggleExamPublic } from "@/actions/exams";
import { toast } from "sonner";
import Link from "next/link";

export type Exam = {
  id: number;
  name: string | null;
  description: string | null;
  examDate: Date | null;
  durationMinutes: number | null;
  totalMarks: number | null;
  isLive: boolean;
  isClosed: boolean;
  isPublic: boolean;
  resultAnnounced: boolean;
  syllabusPdf: string | null;
  coverImage: string | null;
};

interface ExamsTableProps {
  initialExams: Exam[];
}

export function ExamsTable({ initialExams }: ExamsTableProps) {
  const [mounted, setMounted] = useState(false);
  const [exams, setExams] = useState(initialExams);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedExamForResult, setSelectedExamForResult] = useState<Exam | null>(null);
  const [closedDialogOpen, setClosedDialogOpen] = useState(false);
  const [selectedExamForClosed, setSelectedExamForClosed] = useState<Exam | null>(null);
  const [publicDialogOpen, setPublicDialogOpen] = useState(false);
  const [selectedExamForPublic, setSelectedExamForPublic] = useState<Exam | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleToggleClosed = async (id: number, currentStatus: boolean) => {
    try {
      const result = await toggleExamClosed(id, !currentStatus);
      if (result.success) {
        setExams(exams.map(exam => 
          exam.id === id ? { ...exam, isClosed: !currentStatus } : exam
        ));
        toast.success(`Exam is now ${!currentStatus ? 'closed' : 'opened'}`);
        setClosedDialogOpen(false);
        setSelectedExamForClosed(null);
      } else {
        toast.error(result.error || "Failed to update exam closed status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleTogglePublic = async (id: number, currentStatus: boolean) => {
    try {
      const result = await toggleExamPublic(id, !currentStatus);
      if (result.success) {
        setExams(exams.map(exam => 
          exam.id === id ? { ...exam, isPublic: !currentStatus } : exam
        ));
        toast.success(`Exam is now ${!currentStatus ? 'public' : 'draft'}`);
        setPublicDialogOpen(false);
        setSelectedExamForPublic(null);
      } else {
        toast.error(result.error || "Failed to update exam visibility");
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

  const openClosedDialog = (exam: Exam) => {
    setSelectedExamForClosed(exam);
    setClosedDialogOpen(true);
  };

  const openPublicDialog = (exam: Exam) => {
    setSelectedExamForPublic(exam);
    setPublicDialogOpen(true);
  };

  // Don't render anything on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">Loading...</div>
      </div>
    );
  }

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
              <TableHead>Closed</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Results</TableHead>
              <TableHead>Assign Students</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow 
                key={exam.id} 
                className={!exam.isPublic ? "bg-yellow-50/50 hover:bg-yellow-50" : ""}
                suppressHydrationWarning
              >
                <TableCell className="font-medium" suppressHydrationWarning>
                  <div className="flex items-center gap-2 flex-wrap">
                    {!exam.isPublic && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                        Draft
                      </Badge>
                    )}
                    <span>{exam.name || "Untitled"}</span>
                  </div>
                </TableCell>
                <TableCell suppressHydrationWarning>
                  {exam.examDate 
                    ? format(new Date(exam.examDate), "MMM dd, yyyy")
                    : "Not set"}
                </TableCell>
                <TableCell suppressHydrationWarning>
                  {exam.durationMinutes 
                    ? `${exam.durationMinutes} min`
                    : "Not set"}
                </TableCell>
                <TableCell suppressHydrationWarning>
                  {exam.totalMarks || "Not set"}
                </TableCell>
                <TableCell suppressHydrationWarning>
                  <Badge variant={exam.isLive ? "default" : "secondary"}>
                    {exam.isLive ? "Live" : "Not Live"}
                  </Badge>
                </TableCell>
                <TableCell suppressHydrationWarning>
                  {exam.isClosed ? (
                    <Badge variant="destructive">Closed</Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Open
                    </Badge>
                  )}
                </TableCell>
                <TableCell suppressHydrationWarning>
                  {exam.isPublic ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      <Eye className="w-3 h-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell suppressHydrationWarning>
                  {exam.resultAnnounced ? (
                    <Badge className="bg-green-600">Results Declared</Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell suppressHydrationWarning>
                  <Link href={'/dashboard/exams/students/'+exam.id}>
                    <Button variant={"outline"} size={"sm"}>
                      <Users className="w-4 h-4 mr-1" />
                      Assign
                    </Button>
                  </Link>
                </TableCell>
                <TableCell className="text-right" suppressHydrationWarning>
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
                        <FileText className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openPublicDialog(exam)}>
                        {exam.isPublic ? (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Move to Draft
                          </>
                        ) : (
                          <>
                            <Globe2 className="mr-2 h-4 w-4" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
                      <DropdownMenuItem onClick={() => openClosedDialog(exam)}>
                        {exam.isClosed ? (
                          <>
                            <LockOpen className="mr-2 h-4 w-4" />
                            Open Exam
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Close Exam
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

      {/* Public/Draft Exam Confirmation Dialog */}
      <AlertDialog open={publicDialogOpen} onOpenChange={setPublicDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedExamForPublic?.isPublic ? "Move to Draft" : "Make Exam Public"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedExamForPublic?.isPublic ? (
                <>
                  Are you sure you want to move <strong>{selectedExamForPublic?.name}</strong> to draft?
                  <br /><br />
                  <strong>Warning:</strong> Once moved to draft:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>The exam will be hidden from students</li>
                    <li>Students cannot access or take the exam</li>
                    <li>Existing attempts will be preserved but hidden</li>
                  </ul>
                </>
              ) : (
                <>
                  Are you sure you want to make <strong>{selectedExamForPublic?.name}</strong> public?
                  <br /><br />
                  Once public:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>The exam will be visible to all eligible students</li>
                    <li>Students can view exam details</li>
                    <li><strong>Note:</strong> The exam needs to be &quot;Live&quot; to be taken by students</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedExamForPublic && handleTogglePublic(
                selectedExamForPublic.id, 
                selectedExamForPublic.isPublic
              )}
              className={selectedExamForPublic?.isPublic ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
            >
              {selectedExamForPublic?.isPublic ? "Move to Draft" : "Make Public"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Closed/Open Exam Confirmation Dialog */}
      <AlertDialog open={closedDialogOpen} onOpenChange={setClosedDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedExamForClosed?.isClosed ? "Open Exam" : "Close Exam"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedExamForClosed?.isClosed ? (
                <>
                  Are you sure you want to open <strong>{selectedExamForClosed?.name}</strong>?
                  <br /><br />
                  Students will be able to access and take this exam again.
                </>
              ) : (
                <>
                  Are you sure you want to close <strong>{selectedExamForClosed?.name}</strong>?
                  <br /><br />
                  <strong>Warning:</strong> Once closed, students will no longer be able to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Start new attempts</li>
                    <li>Submit their answers</li>
                    <li>Access the exam</li>
                  </ul>
                  <br />
                  Make sure all students have completed their attempts before closing.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedExamForClosed && handleToggleClosed(
                selectedExamForClosed.id, 
                selectedExamForClosed.isClosed
              )}
              className={selectedExamForClosed?.isClosed ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {selectedExamForClosed?.isClosed ? "Open Exam" : "Close Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
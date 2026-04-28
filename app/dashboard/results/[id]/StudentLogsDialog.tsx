// components/dashboard/results/StudentLogsDialog.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  AlertTriangle, 
  FileText, 
  Activity,
  MousePointer,
  Keyboard,
  Monitor,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { getStudentLogs } from "@/actions/results2";
import { toast } from "sonner";

interface StudentLogsDialogProps {
  registrationId: number;
  studentName: string;
  examName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CheatingLog {
  id: number;
  eventType: string;
  createdAt: string;
}

interface AttemptLog {
  id: number;
  action: string;
  data: Record<string, unknown>;
  createdAt: string;
}

interface StudentAnswer {
  id: number;
  questionId: number;
  question: string;
  selectedOption: string;
  answerText: string;
  isCorrect: boolean;
  marksAwarded: number;
  questionType: string;
}

// Helper function to convert any data to Record<string, unknown>
function toRecord(obj: unknown): Record<string, unknown> {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return obj as Record<string, unknown>;
  }
  return {};
}

export function StudentLogsDialog({ 
  registrationId, 
  studentName, 
  examName, 
  open, 
  onOpenChange 
}: StudentLogsDialogProps) {
  const [cheatingLogs, setCheatingLogs] = useState<CheatingLog[]>([]);
  const [attemptLogs, setAttemptLogs] = useState<AttemptLog[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cheating");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getStudentLogs(registrationId);
      if (result.success) {
        // Transform the data to match our interfaces
        const transformedCheatingLogs: CheatingLog[] = (result.cheatingLogs || []).map(log => ({
          id: log.id,
          eventType: log.eventType || "unknown",
          createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString()
        }));
        
        const transformedAttemptLogs: AttemptLog[] = (result.attemptLogs || []).map(log => ({
          id: log.id,
          action: log.action || "unknown",
          data: toRecord(log.data), // Convert to Record<string, unknown>
          createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString()
        }));
        
        const transformedAnswers: StudentAnswer[] = (result.studentAnswers || []).map(answer => ({
          id: answer.id,
          questionId: answer.questionId || 0,
          question: answer.question || "Unknown Question",
          selectedOption: answer.selectedOption || "No answer",
          answerText: answer.answerText || "",
          isCorrect: answer.isCorrect || false,
          marksAwarded: answer.marksAwarded || 0,
          questionType: answer.questionType || "mcq"
        }));
        
        setCheatingLogs(transformedCheatingLogs);
        setAttemptLogs(transformedAttemptLogs);
        setStudentAnswers(transformedAnswers);
      } else {
        toast.error(result.error || "Failed to fetch logs");
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      toast.error("Something went wrong while fetching logs");
    } finally {
      setLoading(false);
    }
  }, [registrationId]);

  useEffect(() => {
    if (open && registrationId) {
      fetchLogs();
    }
  }, [open, registrationId, fetchLogs]);

  const getEventIcon = (eventType: string) => {
    switch (eventType?.toLowerCase()) {
      case "tab_switch":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "copy_paste":
      case "copy":
      case "paste":
      case "cut":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "right_click":
        return <MousePointer className="h-4 w-4 text-purple-500" />;
      case "keyboard_shortcut":
      case "devtools_f12":
      case "devtools_shortcut":
        return <Keyboard className="h-4 w-4 text-blue-500" />;
      case "fullscreen_exit":
      case "fullscreen_long_exit":
      case "fullscreen_failed":
        return <Monitor className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case "start_exam":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "submit_exam":
      case "submit_success":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "save_answer":
      case "answer_changed":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "review_question":
      case "navigate_question":
        return <Eye className="h-4 w-4 text-indigo-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventDescription = (eventType: string) => {
    switch (eventType?.toLowerCase()) {
      case "tab_switch":
        return "Student switched browser tab";
      case "tab_switch_long":
        return "Student switched tab for extended period";
      case "copy_paste":
      case "copy":
        return "Student attempted to copy content";
      case "paste":
        return "Student attempted to paste content";
      case "cut":
        return "Student attempted to cut content";
      case "right_click":
        return "Student used right-click";
      case "keyboard_shortcut":
        return "Student used keyboard shortcut";
      case "fullscreen_exit":
        return "Student exited fullscreen mode";
      case "fullscreen_long_exit":
        return "Student exited fullscreen for extended period";
      case "fullscreen_failed":
        return "Failed to enter fullscreen mode";
      case "window_blur":
        return "Window lost focus";
      case "window_focus":
        return "Window regained focus";
      case "mouse_leave_window":
        return "Mouse left the window";
      case "window_resize":
        return "Window was resized";
      case "devtools_f12":
        return "Attempted to open DevTools (F12)";
      case "devtools_shortcut":
        return "Attempted to open DevTools (Shortcut)";
      case "view_source":
        return "Attempted to view page source";
      case "save_attempt":
        return "Attempted to save page";
      case "print_attempt":
        return "Attempted to print page";
      case "alt_tab":
        return "Attempted Alt+Tab";
      case "windows_key":
        return "Windows key pressed";
      default:
        return eventType?.replace(/_/g, " ") || "Unknown event";
    }
  };

  const getActionDescription = (action: string) => {
    switch (action?.toLowerCase()) {
      case "start_exam":
        return "Student started the exam";
      case "submit_exam":
      case "submit_success":
        return "Student submitted the exam";
      case "submit_attempt":
        return "Student attempted to submit";
      case "submit_failed":
        return "Submission failed";
      case "save_answer":
      case "answer_changed":
        return "Student saved/updated an answer";
      case "navigate_question":
        return "Student navigated between questions";
      case "review_question":
        return "Student reviewed a question";
      case "time_ended":
        return "Exam time ended automatically";
      case "before_unload":
        return "Page reload/close attempted";
      case "cheating_violation":
        return "Cheating violation detected";
      case "exam_flagged":
        return "Exam flagged for review";
      case "fullscreen_entered":
        return "Entered fullscreen mode";
      case "question_time":
        return "Time spent on question";
      default:
        return action?.replace(/_/g, " ") || "Unknown action";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
    } catch {
      return "Invalid date";
    }
  };

  // Helper to check if object has keys
  const hasData = (data: Record<string, unknown>): boolean => {
    return data && Object.keys(data).length > 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[75vw] w-full max-h-[85vh] h-full flex flex-col p-0 gap-0">
        {/* Header - Fixed at top */}
        <div className="px-6 py-4 border-b">
          <DialogHeader className="p-0">
            <DialogTitle className="text-2xl">
              Student Activity Logs
            </DialogTitle>
            <DialogDescription>
              {studentName} - {examName}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tabs - Fixed below header */}
        <div className="px-6 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cheating" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Cheating Logs ({cheatingLogs.length})
              </TabsTrigger>
              <TabsTrigger value="answers" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Student Answers ({studentAnswers.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity Logs ({attemptLogs.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Cheating Logs Tab */}
            <TabsContent value="cheating" className="m-0 mt-0">
              {loading ? (
                <div className="text-center py-8">Loading logs...</div>
              ) : cheatingLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>No cheating attempts detected</p>
                  <p className="text-sm">Student maintained exam integrity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card className="bg-red-50 dark:bg-red-950/20">
                    <CardHeader>
                      <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Cheating Attempts Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {cheatingLogs.length}
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-500">
                        Total cheating incidents detected
                      </p>
                    </CardContent>
                  </Card>

                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Event Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cheatingLogs.map((log, index) => (
                          <TableRow key={log.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getEventIcon(log.eventType)}
                                <Badge variant="outline" className="uppercase">
                                  {log.eventType}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{getEventDescription(log.eventType)}</TableCell>
                            <TableCell className="font-mono text-xs whitespace-nowrap">
                              {formatDate(log.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Student Answers Tab */}
            <TabsContent value="answers" className="m-0 mt-0">
              {loading ? (
                <div className="text-center py-8">Loading answers...</div>
              ) : studentAnswers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3" />
                  <p>No answers found</p>
                  <p className="text-sm">Student has not submitted any answers yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Questions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{studentAnswers.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Correct Answers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {studentAnswers.filter(a => a.isCorrect).length}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Marks Obtained</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {studentAnswers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead>Student Answer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Marks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentAnswers.map((answer, index) => (
                          <TableRow key={answer.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="max-w-md">
                              <div className="break-words">
                                {answer.question}
                                {answer.questionType === "mcq" && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    MCQ
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {answer.questionType === "mcq" 
                                ? answer.selectedOption || "No answer"
                                : answer.answerText || "No answer"
                              }
                            </TableCell>
                            <TableCell>
                              {answer.isCorrect ? (
                                <Badge className="bg-green-600 whitespace-nowrap">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Correct
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="whitespace-nowrap">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Incorrect
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {answer.marksAwarded || 0} marks
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity" className="m-0 mt-0">
              {loading ? (
                <div className="text-center py-8">Loading activity logs...</div>
              ) : attemptLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3" />
                  <p>No activity logs found</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attemptLogs.map((log, index) => (
                        <TableRow key={log.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              {getActionIcon(log.action)}
                              <Badge variant="secondary">
                                {log.action?.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{getActionDescription(log.action)}</TableCell>
                          <TableCell>
                            {hasData(log.data) && (
                              <pre className="text-xs whitespace-pre-wrap max-w-md">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            )}
                            {!hasData(log.data) && "—"}
                          </TableCell>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {formatDate(log.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="px-6 py-4 border-t mt-auto">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
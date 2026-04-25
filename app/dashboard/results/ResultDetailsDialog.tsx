// components/dashboard/results/ResultDetailsDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ManualCheckDialog } from "./ManualCheckDialog"; 
import { getStudentAnswers, evaluateMCQForRegistration } from "@/actions/results2";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Edit } from "lucide-react";

type Registration = {
  id: number;
  examId: number;
  studentName: string;
  examName: string;
  examTotalMarks: number;
  score: number;
};

type Answer = {
  id: number;
  questionId: number;
  questionText: string;
  questionType: "mcq" | "subjective";
  marks: number;
  selectedOptionId: number | null;
  selectedOptionText: string | null;
  correctOptionText: string | null;
  isCorrect: boolean | null;
  marksAwarded: number | null;
  answerText: string | null;
};

interface ResultDetailsDialogProps {
  registration: Registration;
  open: boolean;
  onOpenChange: () => void;
  onUpdate: () => void;
}

export function ResultDetailsDialog({
  registration,
  open,
  onOpenChange,
  onUpdate,
}: ResultDetailsDialogProps) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [isManualCheckOpen, setIsManualCheckOpen] = useState(false);

  useEffect(() => {
    if (open && registration) {
      loadAnswers();
    }
  }, [open, registration]);

  const loadAnswers = async () => {
    setLoading(true);
    try {
      const data = await getStudentAnswers(registration.id);
      // Transform data to ensure required fields are not null
      const transformedAnswers: Answer[] = data.map(answer => ({
        id: answer.id,
        questionId: answer.questionId ?? 0,
        questionText: answer.questionText ?? "",
        questionType: (answer.questionType ?? "mcq") as "mcq" | "subjective",
        marks: answer.marks ?? 0,
        selectedOptionId: answer.selectedOptionId,
        selectedOptionText: answer.selectedOptionText,
        correctOptionText: answer.correctOptionText,
        isCorrect: answer.isCorrect,
        marksAwarded: answer.marksAwarded,
        answerText: answer.answerText,
      }));
      setAnswers(transformedAnswers);
    } catch (error) {
      toast.error("Failed to load answers");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoEvaluate = async () => {
    setEvaluating(true);
    try {
      const result = await evaluateMCQForRegistration(registration.id);
      if (result.success) {
        toast.success("MCQ questions evaluated");
        await loadAnswers();
        onUpdate();
      } else {
        toast.error(result.error || "Failed to evaluate");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setEvaluating(false);
    }
  };

  const handleManualCheckSave = async () => {
    // Close dialog first
    setIsManualCheckOpen(false);
    setSelectedAnswer(null);
    
    // Then reload only the specific answer or all answers
    await loadAnswers();
    onUpdate();
    toast.success("Subjective answer evaluated successfully");
  };

  const getStatusIcon = (answer: Answer) => {
    if (answer.questionType === "subjective") {
      if (answer.marksAwarded !== null && answer.marksAwarded > 0) {
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      } else if (answer.marksAwarded === 0) {
        return <XCircle className="h-5 w-5 text-red-600" />;
      }
      return <Clock className="h-5 w-5 text-yellow-600" />;
    } else {
      if (answer.isCorrect) {
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      }
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const totalObtained = answers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0);
  const totalPossible = answers.reduce((sum, a) => sum + a.marks, 0);
  const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] min-w-[40vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Exam Results Details</DialogTitle>
          <DialogDescription>
            {registration.studentName} - {registration.examName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">
                {registration.score} / {registration.examTotalMarks}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Current Total</p>
              <p className="text-2xl font-bold">
                {totalObtained} / {totalPossible}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Percentage</p>
              <p className={`text-2xl font-bold ${percentage >= 40 ? "text-green-600" : "text-red-600"}`}>
                {percentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Student Answers</h3>
          <Button onClick={handleAutoEvaluate} disabled={evaluating}>
            {evaluating ? "Evaluating..." : "Auto-Evaluate MCQ"}
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="text-center py-12">Loading answers...</div>
          ) : (
            <div className="space-y-4">
              {answers.map((answer, index) => (
                <Card key={answer.id} className={answer.questionType === "subjective" ? "border-yellow-200" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(answer)}
                        <div>
                          <CardTitle className="text-base">
                            Question {index + 1}: {answer.questionText}
                          </CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              {answer.questionType === "mcq" ? "MCQ" : "Subjective"}
                            </Badge>
                            <Badge variant="outline">{answer.marks} marks</Badge>
                            {answer.marksAwarded !== null && answer.questionType === "subjective" && (
                              <Badge className={answer.marksAwarded > 0 ? "bg-green-600" : "bg-red-600"}>
                                Awarded: {answer.marksAwarded}
                              </Badge>
                            )}
                            {answer.isCorrect === true && answer.questionType === "mcq" && (
                              <Badge className="bg-green-600">Correct</Badge>
                            )}
                            {answer.isCorrect === false && answer.questionType === "mcq" && (
                              <Badge variant="destructive">Incorrect</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Always show edit button for subjective questions */}
                      {answer.questionType === "subjective" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAnswer(answer);
                            setIsManualCheckOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          {answer.marksAwarded !== null ? "Re-evaluate" : "Check"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {answer.questionType === "mcq" ? (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Selected Option:</span>{" "}
                          {answer.selectedOptionText || "Not answered"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Correct Option:</span>{" "}
                          {answer.correctOptionText || "N/A"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          {answer.isCorrect ? (
                            <span className="text-green-600">Correct</span>
                          ) : (
                            <span className="text-red-600">Incorrect</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="font-medium">Student's Answer:</span>
                        </div>
                        <div className="p-3 bg-muted rounded-lg max-h-[200px] overflow-y-auto">
                          {answer.answerText || "No answer provided"}
                        </div>
                        {answer.marksAwarded !== null && (
                          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm">
                              <span className="font-medium">Marks Awarded:</span>{" "}
                              <span className={answer.marksAwarded > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                {answer.marksAwarded} / {answer.marks}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Status:</span>{" "}
                              <span className={answer.marksAwarded > 0 ? "text-green-600" : "text-red-600"}>
                                {answer.marksAwarded === answer.marks ? "Full Marks" : 
                                 answer.marksAwarded > 0 ? "Partial Marks" : "No Marks"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>

      {selectedAnswer && (
        <ManualCheckDialog
          key={selectedAnswer.id} // Add key to force re-render when answer changes
          answer={selectedAnswer}
          open={isManualCheckOpen}
          onOpenChange={(open) => {
            setIsManualCheckOpen(open);
            if (!open) {
              setSelectedAnswer(null);
            }
          }}
          onSave={handleManualCheckSave}
        />
      )}
    </Dialog>
  );
}
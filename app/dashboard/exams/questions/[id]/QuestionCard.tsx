// components/dashboard/questions/QuestionCard.tsx
"use client";

import { useState } from "react";
import { Edit, Trash2, CheckCircle, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { EditQuestionDialog } from "./EditQuestionDialog";

type Option = {
  id: number;
  questionId: number;
  optionText: string | null;
  isCorrect: boolean | null;
};

type Question = {
  id: number;
  examId: number;
  question: string;
  questionType: "mcq" | "subjective";
  marks: number | null;
  createdAt: Date | null;
  options: Option[];
};

interface QuestionCardProps {
  question: Question;
  index: number;
  onDelete: (id: number) => void;
  onUpdate: (question: Question) => void;
}

export function QuestionCard({ question, index, onDelete, onUpdate }: QuestionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {index + 1}
            </div>
            <div>
              <CardTitle className="text-lg">{question.question}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant={question.questionType === "mcq" ? "default" : "secondary"}>
                  {question.questionType === "mcq" ? "MCQ" : "Subjective"}
                </Badge>
                <Badge variant="outline">{question.marks} marks</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {question.questionType === "mcq" && question.options.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-sm font-medium text-muted-foreground">Options:</p>
              <div className="space-y-1">
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2 text-sm">
                    {option.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={option.isCorrect ? "font-medium text-green-600" : ""}>
                      {option.optionText}
                    </span>
                    {option.isCorrect && (
                      <Badge variant="outline" className="ml-2 text-green-600">
                        Correct Answer
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
              All associated options will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(question.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditQuestionDialog
        question={question}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onQuestionUpdated={onUpdate}
      />
    </>
  );
}
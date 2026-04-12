// components/dashboard/questions/QuestionsList.tsx
"use client";

import { useState } from "react";
import { QuestionCard } from "./QuestionCard"; 
import { deleteQuestion } from "@/actions/questions";
import { toast } from "sonner";

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

interface QuestionsListProps {
  examId: number;
  initialQuestions: Question[];
}

export function QuestionsList({ examId, initialQuestions }: QuestionsListProps) {
  const [questions, setQuestions] = useState(initialQuestions);

  const handleDelete = async (questionId: number) => {
    try {
      const result = await deleteQuestion(questionId);
      if (result.success) {
        setQuestions(questions.filter(q => q.id !== questionId));
        toast.success("Question deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete question");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleUpdate = (updatedQuestion: Question) => {
    setQuestions(questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    ));
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No questions yet</h3>
        <p className="text-muted-foreground mt-2">
          Add your first question to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
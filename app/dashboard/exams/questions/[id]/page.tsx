// app/dashboard/exams/questions/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { questions, options, exams } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { QuestionsList } from "./QuestionsList";
import { AddQuestionDialog } from "./AddQuestionDialog"; 
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionsPage({ params }: PageProps) {
  const { id } = await params;
  const examId = parseInt(id);

  if (isNaN(examId)) {
    notFound();
  }

  // Fetch exam details
  const examList = await db.select()
    .from(exams)
    .where(eq(exams.id, examId))
    .limit(1);

  if (examList.length === 0) {
    notFound();
  }

  const exam = examList[0];

  // Fetch all questions for this exam with their options
  const questionsList = await db.select()
    .from(questions)
    .where(eq(questions.examId, examId))
    .orderBy(questions.createdAt);

  // Fetch options for all questions if there are any questions
  let optionsList: any[] = [];
  if (questionsList.length > 0) {
    const questionIds = questionsList.map(q => q.id);
    optionsList = await db.select()
      .from(options)
      .where(inArray(options.questionId, questionIds));
  }

  // Group options by questionId
  const optionsByQuestion: Record<number, typeof optionsList> = {};
  optionsList.forEach((option) => {
    const questionId = option.questionId;
    if (questionId !== null) {
      if (!optionsByQuestion[questionId]) {
        optionsByQuestion[questionId] = [];
      }
      optionsByQuestion[questionId].push(option);
    }
  });

  // Combine questions with their options with proper type handling
  const questionsWithOptions = questionsList.map(question => ({
    id: question.id,
    examId: question.examId ?? 0,
    question: question.question,
    questionType: (question.questionType ?? "mcq") as "mcq" | "subjective",
    marks: question.marks ?? 0,
    createdAt: question.createdAt,
    options: optionsByQuestion[question.id] || [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/exams">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Questions</h1>
            <p className="text-muted-foreground mt-2">
              {exam.name} • {questionsWithOptions.length} questions
            </p>
          </div>
        </div>
        <AddQuestionDialog examId={examId} />
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading questions...</div>}>
        <QuestionsList 
          examId={examId}
          initialQuestions={questionsWithOptions}
        />
      </Suspense>
    </div>
  );
}
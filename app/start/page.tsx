// app/start/page.tsx
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { examRegistrations, exams, questions, options } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { ExamInterface } from "./ExamInterface";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ examId?: string; registrationId?: string }>;
}

type Option = {
  id: number;
  questionId: number;
  optionText: string | null;
  isCorrect: boolean | null;
};

type QuestionWithOptions = {
  id: number;
  text: string;
  type: "mcq" | "subjective";
  marks: number;
  options: Option[];
};

export default async function StartPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const examId = params.examId ? parseInt(params.examId) : null;
  const registrationId = params.registrationId ? parseInt(params.registrationId) : null;

  if (!examId || !registrationId) {
    redirect("/join");
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

  // Check if exam is live
  if (!exam.isLive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Exam Not Available</h1>
          <p className="text-gray-600 mb-6">
            This exam is not currently live. Please check back later or contact your administrator.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if registration exists and not completed
  const registrationList = await db.select()
    .from(examRegistrations)
    .where(eq(examRegistrations.id, registrationId))
    .limit(1);

  if (registrationList.length === 0) {
    redirect("/join");
  }

  const registration = registrationList[0];

  if (registration.status === "completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Exam Already Completed</h1>
          <p className="text-gray-600 mb-6">
            You have already submitted this exam. Results will be announced soon.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if exam date has passed
  if (exam.examDate && new Date(exam.examDate) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Exam Date Has Passed</h1>
          <p className="text-gray-600 mb-6">
            This exam was scheduled for {new Date(exam.examDate).toLocaleDateString()} and is no longer available.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Fetch all questions for this exam
  const questionsList = await db.select()
    .from(questions)
    .where(eq(questions.examId, examId))
    .orderBy(questions.createdAt);

  // Fetch options for MCQ questions
  const questionIds = questionsList.map(q => q.id);
  let optionsList: Option[] = [];
  if (questionIds.length > 0) {
    const fetchedOptions = await db.select()
      .from(options)
      .where(inArray(options.questionId, questionIds));
    optionsList = fetchedOptions as Option[];
  }

  // Group options by questionId
  const optionsByQuestion: Record<number, Option[]> = {};
  optionsList.forEach(opt => {
    if (!optionsByQuestion[opt.questionId]) {
      optionsByQuestion[opt.questionId] = [];
    }
    optionsByQuestion[opt.questionId].push(opt);
  });

  // Combine questions with options
  const questionsWithOptions: QuestionWithOptions[] = questionsList.map(q => ({
    id: q.id,
    text: q.question,
    type: (q.questionType === "mcq" || q.questionType === "subjective") ? q.questionType : "mcq",
    marks: q.marks ?? 0,
    options: optionsByQuestion[q.id] || [],
  }));

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading exam...</div>}>
      <ExamInterface
        examId={examId}
        registrationId={registrationId}
        examName={exam.name || "Exam"}
        durationMinutes={exam.durationMinutes || 60}
        questions={questionsWithOptions}
      />
    </Suspense>
  );
}
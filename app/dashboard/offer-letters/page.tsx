// app/dashboard/offer-letters/page.tsx
import { Suspense } from "react";
import { getCompanyExams } from "@/actions/exams";
import { getCompanyOfferLetters } from "@/actions/offer-letter";
import { OfferLettersTable } from "./OfferLettersTable";
import { ExamFilter } from "./ExamFilter";

export const dynamic = 'force-dynamic';

async function getExams() {
  return getCompanyExams();
}

async function getOfferLetters(examId?: string) {
  return getCompanyOfferLetters(examId);
}

export default async function OfferLettersPage({
  searchParams,
}: {
  searchParams: Promise<{ examId?: string }>;
}) {
  const params = await searchParams;
  const examId = params.examId;

  const exams = await getExams();
  const offerLetters = await getOfferLetters(examId);
  const selectedExam = exams.find((exam) => String(exam.id) === examId);
  const examConfiguration = selectedExam
    ? {
        resultsAnnounced: selectedExam.resultAnnounced ?? false,
        internshipConfigured: Boolean(
          selectedExam.internshipStartDate &&
            selectedExam.internshipEndDate &&
            selectedExam.internshipDuration
        ),
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offer Letters</h1>
          <p className="text-muted-foreground mt-2">
            Manage and generate internship offer letters for selected candidates.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading exams...</div>}>
        <ExamFilter exams={exams} selectedExamId={examId} />
      </Suspense>

      <Suspense fallback={<div className="text-center py-12">Loading offer letters...</div>}>
        <OfferLettersTable
          key={examId || "all"}
          offerLetters={offerLetters}
          examId={examId}
          examConfiguration={examConfiguration}
        />
      </Suspense>
    </div>
  );
}
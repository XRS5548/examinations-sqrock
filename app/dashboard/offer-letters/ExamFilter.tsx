// app/dashboard/offer-letters/ExamFilter.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Exam {
  id: number;
  name: string | null;
}

interface ExamFilterProps {
  exams: Exam[];
  selectedExamId?: string;
}

export function ExamFilter({ exams, selectedExamId }: ExamFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleExamChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("examId");
    } else {
      params.set("examId", value);
    }
    router.push(`/dashboard/offer-letters?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="exam-filter" className="text-sm font-medium text-muted-foreground">
        Filter by Exam:
      </label>
      <Select
        value={selectedExamId || "all"}
        onValueChange={handleExamChange}
      >
        <SelectTrigger id="exam-filter" className="w-[200px]">
          <SelectValue placeholder="All Exams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Exams</SelectItem>
          {exams.map((exam) => (
            <SelectItem key={exam.id} value={String(exam.id)}>
              {exam.name || "Untitled Exam"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
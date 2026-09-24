"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { OfferLetterResponse } from "@/actions/offer-letter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface OfferLettersTableProps {
  offerLetters: OfferLetterResponse[];
  examId?: string;
  examConfiguration: {
    resultsAnnounced: boolean;
    internshipConfigured: boolean;
  } | null;
}

interface StudentForOfferLetter {
  id: number;
  hasOfferLetter: boolean;
}

interface InternshipSchedule {
  startDate: string;
  endDate: string;
  duration: string;
}

export function OfferLettersTable({
  offerLetters,
  examId,
  examConfiguration,
}: OfferLettersTableProps) {
  const router = useRouter();
  const [showGenerateSheet, setShowGenerateSheet] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<
    StudentForOfferLetter[]
  >([]);
  const [internshipSchedule, setInternshipSchedule] =
    useState<InternshipSchedule | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [studentLoadError, setStudentLoadError] = useState("");

  const pendingCount = availableStudents.filter(
    (student) => !student.hasOfferLetter
  ).length;

  const handleDownload = async (offerLetter: OfferLetterResponse) => {
    try {
      const response = await fetch(
        `/api/offer-letter/download/${offerLetter.offerLetterId}`
      );
      if (!response.ok) {
        throw new Error("Failed to download");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Offer-Letter-${offerLetter.offerLetterId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
      toast.success("Offer letter downloaded successfully");
    } catch {
      toast.error("Failed to download offer letter");
    }
  };

  const handleOpenGenerateSheet = () => {
    if (!examId) return;

    if (examConfiguration && !examConfiguration.resultsAnnounced) {
      toast.error("Announce exam results before creating offer letters", {
        action: {
          label: "Open Exam",
          onClick: () =>
            router.push(`/dashboard/exams?editExamId=${examId}`),
        },
      });
      return;
    }

    if (examConfiguration && !examConfiguration.internshipConfigured) {
      toast.error(
        "Set internship start date, end date, and duration in this exam first",
        {
          action: {
            label: "Edit Exam",
            onClick: () =>
              router.push(`/dashboard/exams?editExamId=${examId}`),
          },
        }
      );
      return;
    }

    setShowGenerateSheet(true);
    setIsLoadingStudents(true);
    setStudentLoadError("");

    fetch(`/api/offer-letter/students/${examId}`)
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to load eligible students");
        }
        return response.json();
      })
      .then((data) => {
        setAvailableStudents(data.students || []);
        setInternshipSchedule(data.internship || null);
      })
      .catch((error) => {
        setStudentLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load eligible students"
        );
      })
      .finally(() => {
        setIsLoadingStudents(false);
      });
  };

  const handleGenerateAll = async () => {
    if (!examId || pendingCount === 0) return;

    setIsGeneratingAll(true);
    try {
      const response = await fetch("/api/offer-letter/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: Number(examId) }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate offer letters");
      }

      if (data.failed > 0) {
        toast.error(
          `${data.generated} generated, ${data.failed} failed. Please try again.`
        );
      } else {
        toast.success(`${data.generated} offer letters generated`);
      }

      setShowGenerateSheet(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate offer letters"
      );
    } finally {
      setIsGeneratingAll(false);
    }
  };

  return (
    <>
      {offerLetters.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No offer letters found</h3>
          <p className="text-muted-foreground mt-2">
            {examId
              ? "No offer letters have been generated for this exam yet."
              : "No offer letters have been generated yet."}
          </p>
          {examId && (
            <Button
              onClick={handleOpenGenerateSheet}
              disabled={isLoadingStudents}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Offer Letter
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Badge variant="outline" className="text-sm w-fit">
              {offerLetters.length} offer letter
              {offerLetters.length !== 1 ? "s" : ""}
            </Badge>

            {examId && (
              <Button
                onClick={handleOpenGenerateSheet}
                disabled={isLoadingStudents}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Offer Letter
              </Button>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Offer Letter ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offerLetters.map((letter, index) => (
                  <TableRow key={letter.id}>
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {letter.offerLetterId}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{letter.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {letter.employeeId}
                      </div>
                    </TableCell>
                    <TableCell>{letter.email || "-"}</TableCell>
                    <TableCell>{letter.designation}</TableCell>
                    <TableCell>{letter.examid}</TableCell>
                    <TableCell>{letter.issueDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Search className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDownload(letter)}
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center gap-2 text-blue-600">
                            <FileText className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog
        open={showGenerateSheet}
        onOpenChange={(open) => {
          if (!isGeneratingAll) setShowGenerateSheet(open);
        }}
      >
        <DialogContent className="left-0 right-0 top-auto bottom-0 translate-x-0 translate-y-0 max-w-none sm:max-w-none w-full max-h-[85vh] overflow-y-auto rounded-t-2xl p-0 gap-0 data-open:slide-in-from-bottom data-closed:slide-out-to-bottom">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">New Offer Letter</DialogTitle>
              <DialogDescription>
                Review the internship schedule and generate offer letters for
                every pending eligible student.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              {isLoadingStudents ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : studentLoadError ? (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {studentLoadError}
                </div>
              ) : (
                <>
                  {internshipSchedule && (
                    <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Start Date
                        </p>
                        <p className="font-medium">
                          {internshipSchedule.startDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">End Date</p>
                        <p className="font-medium">
                          {internshipSchedule.endDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium">
                          {internshipSchedule.duration}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Eligible Students
                      </div>
                      <p className="mt-2 text-2xl font-semibold">
                        {availableStudents.length}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Pending
                      </div>
                      <p className="mt-2 text-2xl font-semibold">
                        {pendingCount}
                      </p>
                    </div>
                  </div>

                  {pendingCount === 0 && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                      All eligible students already have offer letters.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-background p-4">
            <Button
              variant="outline"
              onClick={() => setShowGenerateSheet(false)}
              disabled={isGeneratingAll}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAll}
              disabled={
                isLoadingStudents ||
                isGeneratingAll ||
                pendingCount === 0 ||
                Boolean(studentLoadError)
              }
            >
              {isGeneratingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Go Generate All
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

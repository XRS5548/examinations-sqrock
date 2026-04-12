// components/dashboard/exams/EditExamDialog.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateExam } from "@/actions/exams";
import { toast } from "sonner";
import { Users, FileQuestion, BarChart3, Eye, Link as LinkIcon } from "lucide-react";

const examSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  description: z.string().optional(),
  examDate: z.string().optional(),
  durationMinutes: z.string().optional(),
  totalMarks: z.string().optional(),
  syllabusPdf: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof examSchema>;

interface EditExamDialogProps {
  exam: {
    id: number;
    name: string | null;
    description: string | null;
    examDate: Date | null;
    durationMinutes: number | null;
    totalMarks: number | null;
    syllabusPdf: string | null;
    coverImage: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExamUpdated: (exam: any) => void;
}

export function EditExamDialog({ exam, open, onOpenChange, onExamUpdated }: EditExamDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(examSchema),
  });

  useEffect(() => {
    if (exam) {
      reset({
        name: exam.name || "",
        description: exam.description || "",
        examDate: exam.examDate ? new Date(exam.examDate).toISOString().slice(0, 16) : "",
        durationMinutes: exam.durationMinutes?.toString() || "",
        totalMarks: exam.totalMarks?.toString() || "",
        syllabusPdf: exam.syllabusPdf || "",
        coverImage: exam.coverImage || "",
      });
    }
  }, [exam, reset]);

  const onSubmit = async (data: FormData) => {
    if (!exam) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.examDate) formData.append("examDate", data.examDate);
      if (data.durationMinutes) formData.append("durationMinutes", data.durationMinutes);
      if (data.totalMarks) formData.append("totalMarks", data.totalMarks);
      if (data.syllabusPdf) formData.append("syllabusPdf", data.syllabusPdf);
      if (data.coverImage) formData.append("coverImage", data.coverImage);

      const result = await updateExam(exam.id, formData);
      
      if (result.success) {
        toast.success("Exam updated successfully");
        onExamUpdated(result.exam);
        onOpenChange(false);
      } else {
        toast.error(result.error?.toString() || "Failed to update exam");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyExamLink = () => {
    const url = `${window.location.origin}/exam/${exam?.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Exam link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogDescription>
            Update the exam details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Exam Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Final Examination 2024"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the exam..."
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examDate">Exam Date</Label>
              <Input
                id="examDate"
                type="datetime-local"
                {...register("examDate")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                placeholder="120"
                {...register("durationMinutes")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                placeholder="100"
                {...register("totalMarks")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="syllabusPdf">Syllabus PDF URL</Label>
              <Input
                id="syllabusPdf"
                type="url"
                placeholder="https://..."
                {...register("syllabusPdf")}
              />
              {errors.syllabusPdf && (
                <p className="text-sm text-red-500">{errors.syllabusPdf.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              type="url"
              placeholder="https://..."
              {...register("coverImage")}
            />
            {errors.coverImage && (
              <p className="text-sm text-red-500">{errors.coverImage.message}</p>
            )}
          </div>

          {/* Exam Links Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Label className="text-sm font-semibold mb-2 block">Exam Links</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={copyExamLink}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Copy Student Exam Link
              </Button>
              <p className="text-xs text-muted-foreground">
                Share this link with students to take the exam
              </p>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <Label className="text-sm font-semibold mb-2 block">Exam Management</Label>
            
            {/* Manage Questions Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onOpenChange(false);
                router.push(`/dashboard/exams/questions/${exam?.id}`);
              }}
            >
              <FileQuestion className="mr-2 h-4 w-4" />
              Manage Questions
            </Button>
            
            {/* Assign Students Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onOpenChange(false);
                router.push(`/dashboard/exams/students/${exam?.id}`);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Assign Students
            </Button>

            {/* View Results Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onOpenChange(false);
                router.push(`/dashboard/exams/results/${exam?.id}`);
              }}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Results
            </Button>

            {/* Preview Exam Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onOpenChange(false);
                window.open(`/exam/${exam?.id}`, '_blank');
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Exam
            </Button>
            
            <p className="text-xs text-muted-foreground mt-2">
              Add questions, assign students, view results, or preview the exam
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Exam"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
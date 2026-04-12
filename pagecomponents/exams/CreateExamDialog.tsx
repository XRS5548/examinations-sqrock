// components/dashboard/exams/CreateExamDialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createExam } from "@/actions/exams";
import { toast } from "sonner";

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

export function CreateExamDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: "",
      description: "",
      examDate: "",
      durationMinutes: "",
      totalMarks: "",
      syllabusPdf: "",
      coverImage: "",
    },
  });

  const onSubmit = async (data: FormData) => {
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

      const result = await createExam(formData);
      
      if (result.success) {
        toast.success("Exam created successfully");
        setOpen(false);
        reset();
      } else {
        toast.error(result.error?.toString() || "Failed to create exam");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new exam. You can edit these later.
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

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Exam"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
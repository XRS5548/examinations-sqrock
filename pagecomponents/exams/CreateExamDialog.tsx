// components/dashboard/exams/CreateExamDialog.tsx
"use client";

import { useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { createExam } from "@/actions/exams";
import {
  INTERNSHIP_DURATION_OPTIONS,
  internshipScheduleSchema,
} from "@/lib/internship";
import { toast } from "sonner";

const examSchema = z
  .object({
  name: z.string().min(1, "Exam name is required"),
  description: z.string().optional(),
  examDate: z.string().optional(),
  examCloseDate: z.string().optional(),
  durationMinutes: z.string().optional(),
  totalMarks: z.string().optional(),
  passingScore: z.string().optional(),
  syllabusPdf: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  coverImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  })
  .merge(internshipScheduleSchema);

type FormData = z.infer<typeof examSchema>;

// Available placeholders — single source of truth
const EMAIL_PLACEHOLDERS = [
  { key: "{{name}}", label: "Student Name" },
  { key: "{{examName}}", label: "Exam Name" },
  { key: "{{score}}", label: "Score" },
  { key: "{{totalMarks}}", label: "Total Marks" },
  { key: "{{passingScore}}", label: "Passing Score" },
  { key: "{{result}}", label: "Result (Pass/Fail)" },
];

export function CreateExamDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs for inserting placeholders at cursor position
  const emailSubjectRef = useRef<HTMLInputElement>(null);
  const emailBodyRef = useRef<HTMLTextAreaElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: "",
      description: "",
      examDate: "",
      examCloseDate: "",
      durationMinutes: "",
      totalMarks: "",
      passingScore: "60",
      internshipStartDate: "",
      internshipEndDate: "",
      internshipDuration: "1 Month",
      syllabusPdf: "",
      coverImage: "",
      emailSubject: "Your Exam Result – {{examName}}",
      emailBody: `Dear {{name}},

Your result for the exam "{{examName}}" has been announced.

Score: {{score}} / {{totalMarks}}
Passing Score: {{passingScore}}
Result: {{result}}

Thank you for participating.

Regards,
SQROCK Team`,
    },
  });

  const internshipDuration = useWatch({
    control,
    name: "internshipDuration",
  });

  // Insert placeholder at cursor position in a controlled input/textarea
  const insertPlaceholder = (
    field: "emailSubject" | "emailBody",
    placeholder: string
  ) => {
    const ref = field === "emailSubject" ? emailSubjectRef : emailBodyRef;
    const el = ref.current;
    if (!el) return;

    const currentValue = getValues(field) || "";
    const start = el.selectionStart ?? currentValue.length;
    const end = el.selectionEnd ?? currentValue.length;

    const newValue =
      currentValue.slice(0, start) +
      placeholder +
      currentValue.slice(end);

    setValue(field, newValue, { shouldDirty: true });

    // Restore cursor position after React re-renders
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + placeholder.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.examDate) formData.append("examDate", data.examDate);
      if (data.examCloseDate)
        formData.append("examCloseDate", data.examCloseDate);
      if (data.durationMinutes)
        formData.append("durationMinutes", data.durationMinutes);
      if (data.totalMarks) formData.append("totalMarks", data.totalMarks);
      if (data.passingScore) formData.append("passingScore", data.passingScore);
      formData.append("internshipStartDate", data.internshipStartDate);
      formData.append("internshipEndDate", data.internshipEndDate);
      formData.append("internshipDuration", data.internshipDuration);
      if (data.syllabusPdf) formData.append("syllabusPdf", data.syllabusPdf);
      if (data.coverImage) formData.append("coverImage", data.coverImage);
      if (data.emailSubject)
        formData.append("emailSubject", data.emailSubject);
      if (data.emailBody) formData.append("emailBody", data.emailBody);

      const result = await createExam(formData);

      if (result.success) {
        toast.success("Exam created successfully");
        setOpen(false);
        reset();
      } else {
        toast.error(result.error?.toString() || "Failed to create exam");
      }
    } catch {
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new exam. You can edit these later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Exam Name */}
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the exam..."
              {...register("description")}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examDate">Exam Date (Start)</Label>
              <Input
                id="examDate"
                type="datetime-local"
                {...register("examDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examCloseDate">Exam Close Date (End)</Label>
              <Input
                id="examCloseDate"
                type="datetime-local"
                {...register("examCloseDate")}
              />
              <p className="text-xs text-muted-foreground">
                When the exam submission window closes
              </p>
            </div>
          </div>

          {/* Duration, Total Marks, Passing Score */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (min)</Label>
              <Input
                id="durationMinutes"
                type="number"
                placeholder="120"
                {...register("durationMinutes")}
              />
            </div>
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
              <Label htmlFor="passingScore">Passing Score</Label>
              <Input
                id="passingScore"
                type="number"
                placeholder="60"
                {...register("passingScore")}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Internship Schedule</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="internshipStartDate">Internship Start Date *</Label>
                <Input
                  id="internshipStartDate"
                  type="date"
                  {...register("internshipStartDate")}
                />
                {errors.internshipStartDate && (
                  <p className="text-sm text-red-500">
                    {errors.internshipStartDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="internshipEndDate">Internship End Date *</Label>
                <Input
                  id="internshipEndDate"
                  type="date"
                  {...register("internshipEndDate")}
                />
                {errors.internshipEndDate && (
                  <p className="text-sm text-red-500">
                    {errors.internshipEndDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="internshipDuration">Internship Duration *</Label>
                <Select
                  value={internshipDuration}
                  onValueChange={(value) =>
                    setValue("internshipDuration", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="internshipDuration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERNSHIP_DURATION_OPTIONS.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.internshipDuration && (
                  <p className="text-sm text-red-500">
                    {errors.internshipDuration.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Syllabus PDF */}
          <div className="space-y-2">
            <Label htmlFor="syllabusPdf">Syllabus PDF URL</Label>
            <Input
              id="syllabusPdf"
              type="url"
              placeholder="https://..."
              {...register("syllabusPdf")}
            />
            {errors.syllabusPdf && (
              <p className="text-sm text-red-500">
                {errors.syllabusPdf.message}
              </p>
            )}
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              type="url"
              placeholder="https://..."
              {...register("coverImage")}
            />
            {errors.coverImage && (
              <p className="text-sm text-red-500">
                {errors.coverImage.message}
              </p>
            )}
          </div>

          {/* ============ EMAIL SECTION ============ */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-3">
              Result Email Template
            </h3>

            {/* Placeholder chips */}
            <div className="mb-3">
              <Label className="text-xs text-muted-foreground">
                Click a placeholder to insert it at cursor position:
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EMAIL_PLACEHOLDERS.map((p) => (
                  <Badge
                    key={p.key}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() =>
                      insertPlaceholder(
                        // If focus was last on subject, insert there; else body
                        document.activeElement === emailSubjectRef.current
                          ? "emailSubject"
                          : "emailBody",
                        p.key
                      )
                    }
                  >
                    {p.key}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Email Subject */}
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Email Subject</Label>
              <Input
                id="emailSubject"
                placeholder="Your Exam Result – {{examName}}"
                {...register("emailSubject")}
                ref={(e) => {
                  register("emailSubject").ref(e);
                  emailSubjectRef.current = e;
                }}
              />
            </div>

            {/* Email Body */}
            <div className="space-y-2 mt-3">
              <Label htmlFor="emailBody">Email Body</Label>
              <Textarea
                id="emailBody"
                rows={10}
                placeholder="Dear {{name}}, ..."
                {...register("emailBody")}
                ref={(e) => {
                  register("emailBody").ref(e);
                  emailBodyRef.current = e;
                }}
              />
              <p className="text-xs text-muted-foreground">
                Use placeholders like{" "}
                <code className="bg-muted px-1 rounded">{"{{name}}"}</code>,{" "}
                <code className="bg-muted px-1 rounded">{"{{score}}"}</code>,
                etc.
              </p>
            </div>
          </div>

          {/* Actions */}
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
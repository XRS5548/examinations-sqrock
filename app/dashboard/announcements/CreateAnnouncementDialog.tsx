// components/dashboard/announcements/CreateAnnouncementDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAnnouncement } from "@/actions/announcements";
import { getCompanyExams } from "@/actions/exams";
import { toast } from "sonner";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
  examId: z.string().optional(),
});

type FormData = z.infer<typeof announcementSchema>;

type Exam = {
  id: number;
  name: string | null;
};

export function CreateAnnouncementDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      description: "",
      examId: "",
    },
  });

  // Fetch company exams when dialog opens
  useEffect(() => {
    if (open) {
      const fetchExams = async () => {
        setLoadingExams(true);
        try {
          const examsList = await getCompanyExams();
          setExams(examsList);
        } catch (error) {
          console.error("Failed to fetch exams:", error);
        } finally {
          setLoadingExams(false);
        }
      };
      fetchExams();
    }
  }, [open]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      if (data.examId && data.examId !== "none") {
        formData.append("examId", data.examId);
      }

      const result = await createAnnouncement(formData);

      if (result.success) {
        toast.success("Announcement created successfully");
        setOpen(false);
        reset();
        window.location.reload();
      } else {
        const errorMessage = typeof result.error === "string" ? result.error : "Failed to create announcement";
        toast.error(errorMessage);
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
          Create Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
          <DialogDescription>
            Share important updates with your students. You can optionally link this announcement to a specific exam.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Upcoming Exam Schedule"
              {...register("title")}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the announcement..."
              {...register("description")}
              rows={5}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Max 1000 characters
            </p>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="examId">Related Exam (Optional)</Label>
            <Select
              onValueChange={(value) => setValue("examId", value)}
              disabled={loading || loadingExams}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingExams ? "Loading exams..." : "Select an exam (optional)"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (General Announcement)</SelectItem>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id.toString()}>
                    {exam.name || `Exam #${exam.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Link this announcement to a specific exam for targeted communication
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Announcement"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
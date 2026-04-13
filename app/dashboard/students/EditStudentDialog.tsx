// components/dashboard/students/EditStudentDialog.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStudent } from "@/actions/students"; 
import { toast } from "sonner";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  dob: z.string().optional(),
});

type FormData = z.infer<typeof studentSchema>;

interface EditStudentDialogProps {
  student: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    dob: Date | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentUpdated: (student: any) => void;
}

export function EditStudentDialog({
  student,
  open,
  onOpenChange,
  onStudentUpdated,
}: EditStudentDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(studentSchema),
  });

  useEffect(() => {
    if (student) {
      reset({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
      });
    }
  }, [student, reset]);

  const onSubmit = async (data: FormData) => {
    if (!student) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("studentId", student.id.toString());
      formData.append("name", data.name);
      if (data.email) formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.dob) formData.append("dob", data.dob);

      const result = await updateStudent(formData);

      if (result.success) {
        toast.success("Student updated successfully");
        onStudentUpdated(result.student);
        onOpenChange(false);
      } else {
        toast.error(result.error?.toString() || "Failed to update student");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update the student's details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              {...register("email")}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              {...register("phone")}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              {...register("dob")}
              disabled={loading}
            />
            {errors.dob && (
              <p className="text-sm text-red-500">{errors.dob.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Student"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
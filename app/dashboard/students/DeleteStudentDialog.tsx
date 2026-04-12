// components/dashboard/students/DeleteStudentDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteStudent } from "@/actions/students";
import { toast } from "sonner";

interface DeleteStudentDialogProps {
  student: {
    id: number;
    name: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentDeleted: (studentId: number) => void;
}

export function DeleteStudentDialog({
  student,
  open,
  onOpenChange,
  onStudentDeleted,
}: DeleteStudentDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      const result = await deleteStudent(student.id);
      
      if (result.success) {
        toast.success("Student deleted successfully");
        onStudentDeleted(student.id);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to delete student");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Student</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {student?.name || "this student"}? 
            This action cannot be undone. All exam registrations and answers 
            associated with this student will also be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
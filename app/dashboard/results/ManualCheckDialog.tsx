// components/dashboard/results/ManualCheckDialog.tsx
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { submitManualMarks , calculateFinalScore } from "@/actions/results2";
import { toast } from "sonner";

type Answer = {
  id: number;
  questionText: string;
  marks: number;
  answerText: string | null;
  marksAwarded: number | null;
};

interface ManualCheckDialogProps {
  answer: Answer;
  open: boolean;
  onOpenChange: () => void;
  onSave: () => void;
}

export function ManualCheckDialog({
  answer,
  open,
  onOpenChange,
  onSave,
}: ManualCheckDialogProps) {
  const [marks, setMarks] = useState<number>(answer.marksAwarded || 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (marks < 0 || marks > answer.marks) {
      toast.error(`Marks must be between 0 and ${answer.marks}`);
      return;
    }

    setLoading(true);
    try {
      const result = await submitManualMarks(answer.id, marks);
      if (result.success) {
        toast.success("Marks awarded successfully");
        
        // Calculate final score for the registration
        await calculateFinalScore(result.registrationId!);
        
        onSave();
        onOpenChange();
      } else {
        toast.error(result.error || "Failed to save marks");
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
          <DialogTitle>Manual Evaluation</DialogTitle>
          <DialogDescription>
            Review the student's answer and award marks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Question</Label>
            <div className="mt-1 p-3 bg-muted rounded-lg">
              {answer.questionText}
            </div>
          </div>

          <div>
            <Label>Student's Answer</Label>
            <div className="mt-1 p-3 bg-muted rounded-lg">
              {answer.answerText || "No answer provided"}
            </div>
          </div>

          <div>
            <Label htmlFor="marks">Award Marks (Max: {answer.marks})</Label>
            <Input
              id="marks"
              type="number"
              min={0}
              max={answer.marks}
              value={marks}
              onChange={(e) => setMarks(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Marks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
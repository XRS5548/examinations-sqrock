// components/dashboard/results/ManualCheckDialog.tsx
"use client";

import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitManualMarks, calculateFinalScore } from "@/actions/results2";
import { toast } from "sonner";

type Answer = {
  id: number;
  questionText: string;
  marks: number;
  answerText: string | null;
  marksAwarded: number | null;
  registrationId?: number;
};

interface ManualCheckDialogProps {
  answer: Answer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function ManualCheckDialog({
  answer,
  open,
  onOpenChange,
  onSave,
}: ManualCheckDialogProps) {
  const [loading, setLoading] = useState(false);
  const [evaluationType, setEvaluationType] = useState<"correct" | "partial" | "incorrect">("incorrect");
  const [partialMarks, setPartialMarks] = useState<number>(0);

  // Reset state when dialog opens with new answer
  useEffect(() => {
    if (open && answer) {
      if (answer.marksAwarded !== null && answer.marksAwarded === answer.marks) {
        setEvaluationType("correct");
        setPartialMarks(answer.marks);
      } else if (answer.marksAwarded !== null && answer.marksAwarded > 0) {
        setEvaluationType("partial");
        setPartialMarks(answer.marksAwarded);
      } else {
        setEvaluationType("incorrect");
        setPartialMarks(0);
      }
    }
  }, [open, answer]);

  const handleSubmit = async () => {
    let marksToAward = 0;
    
    switch (evaluationType) {
      case "correct":
        marksToAward = answer.marks;
        break;
      case "incorrect":
        marksToAward = 0;
        break;
      case "partial":
        marksToAward = partialMarks;
        if (marksToAward < 0 || marksToAward > answer.marks) {
          toast.error(`Marks must be between 0 and ${answer.marks}`);
          return;
        }
        break;
    }

    setLoading(true);
    try {
      const result = await submitManualMarks(answer.id, marksToAward);
      
      if (result.success) {
        toast.success(`Marks awarded: ${marksToAward}/${answer.marks}`);
        
        // Calculate final score for the registration
        if (result.registrationId) {
          await calculateFinalScore(result.registrationId);
        }
        
        // Call onSave to refresh parent data
        onSave();
        
        // Close dialog after a short delay to ensure parent refresh
        setTimeout(() => {
          onOpenChange(false);
        }, 100);
      } else {
        toast.error(result.error || "Failed to save marks");
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Manual Evaluation</DialogTitle>
          <DialogDescription>
            Review the student's answer and award marks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Question</Label>
            <div className="mt-1 p-3 bg-muted rounded-lg max-h-[100px] overflow-y-auto">
              {answer.questionText}
            </div>
          </div>

          <div>
            <Label>Student's Answer</Label>
            <div className="mt-1 p-3 bg-muted rounded-lg max-h-[200px] overflow-y-auto whitespace-pre-wrap">
              {answer.answerText || "No answer provided"}
            </div>
          </div>

          <div>
            <Label>Evaluation</Label>
            <RadioGroup
              value={evaluationType}
              onValueChange={(value: "correct" | "partial" | "incorrect") => {
                setEvaluationType(value);
                if (value === "correct") {
                  setPartialMarks(answer.marks);
                } else if (value === "incorrect") {
                  setPartialMarks(0);
                }
              }}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="correct" id="correct" />
                <Label htmlFor="correct" className="flex-1 cursor-pointer">
                  <span className="font-medium text-green-600">Correct</span>
                  <p className="text-xs text-muted-foreground">Award full marks ({answer.marks} marks)</p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="flex-1 cursor-pointer">
                  <span className="font-medium text-yellow-600">Partially Correct</span>
                  <p className="text-xs text-muted-foreground">Award partial marks</p>
                </Label>
              </div>
              
              {evaluationType === "partial" && (
                <div className="ml-6 pl-6 border-l-2 border-yellow-300">
                  <Label htmlFor="partialMarks" className="text-sm">
                    Marks to award (0-{answer.marks})
                  </Label>
                  <input
                    type="number"
                    id="partialMarks"
                    min={0}
                    max={answer.marks}
                    step={0.5}
                    value={partialMarks}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= answer.marks) {
                        setPartialMarks(value);
                      }
                    }}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="incorrect" id="incorrect" />
                <Label htmlFor="incorrect" className="flex-1 cursor-pointer">
                  <span className="font-medium text-red-600">Incorrect</span>
                  <p className="text-xs text-muted-foreground">Award 0 marks</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Saving..." : "Save Marks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}